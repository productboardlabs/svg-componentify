const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { exec } = require("child_process");
const camelcase = require("lodash.camelcase");
const svgr = require("@svgr/core").default;
const pbfied = require("./svgr/pbfied");

function ensurePaths(options) {
  const { exportPath, iconPath } = options;
  let valid = true;

  if (!fs.existsSync(exportPath)) {
    console.log("EXPORT_PATH doesn't exists!");
    valid = false;
  }

  if (!fs.existsSync(iconPath)) {
    console.log("ICON_PATH doesn't exists!");
    valid = false;
  }

  if (!valid) {
    process.exit(0);
  }
}

async function prompt(question, { answer, correct, fallback }) {
  // ask user what to do
  return await new Promise(res => {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.question(question, function(userInput) {
      if (userInput === answer) {
        console.log(correct);
        rl.close();
        return res(true);
      }

      if (fallback) {
        console.log(fallback);
      }
      rl.close();
      res(false);
    });
  });
}

function getComponentNameFromFileName(file) {
  const name = file.split(".")[0];

  const camelSized = camelcase(name);

  // create ComponentName, first letter should be uppercased
  return camelSized.charAt(0).toUpperCase() + camelSized.slice(1);
}

async function getComponentCode(svgCode, name) {
  return svgr(
    svgCode,
    {
      icon: true,
      expandProps: null,
      plugins: [
        "@svgr/plugin-svgo",
        "@svgr/plugin-jsx",
        pbfied,
        "@svgr/plugin-prettier"
      ]
    },
    { componentName: name }
  );
}

async function generateComponent(iconName, options) {
  const { suffix, extension, exportPath, iconPath } = options;
  console.log(`Processing "${iconName}"...`);

  const componentName = getComponentNameFromFileName(iconName);
  const componentPath = `${exportPath}/${componentName}.${suffix}.${extension}`;
  const svgPath = `${iconPath}/${iconName}`;

  // check if the import path exists, if not the file has been removed (from git history) so we want to delete it
  if (!fs.existsSync(svgPath)) {
    const shouldPersist = await prompt(
      "This SVG file has been removed, do you want to remove it completely? n/[y]: ",
      {
        answer: "n",
        correct: `Skipped. Component "${componentName}" is persisted.`,
        fallback: "Removing..."
      }
    );

    if (shouldPersist) {
      // do nothing
      return;
    }

    // otherwise, try to remove the file
    try {
      fs.unlinkSync(componentPath);
      console.log("File has been deleted!");
    } catch (e) {
      console.log(
        "Error in removing the file :(. The file might be still persisted."
      );
    }

    // and we don't want to proceed to generation of the SVG
    return;
  }

  let shouldWrite = true;
  // check if the component file already exists
  if (fs.existsSync(componentPath)) {
    shouldWrite = await prompt("Overwrite? [n]/y:", {
      answer: "y",
      correct: "Rewriting...",
      fallback: null
    });
  }

  if (!shouldWrite) {
    console.log(`Skipped! Component "${componentName}" is untouched.`);
    return;
  }

  console.log(`Generating ${iconName}...`);
  const svgFile = fs.readFileSync(svgPath);
  const svgCode = svgFile.toString();
  const componentCode = await getComponentCode(svgCode, componentName);

  fs.writeFileSync(componentPath, componentCode);

  console.log(`Component "${componentName}" has been generated!`);
  return componentPath;
}

function createIndexFile(icons, options) {
  const { exportPath, suffix } = options;
  let content = "";

  for (icon of icons) {
    name = getComponentNameFromFileName(icon);

    content += `export { default as ${name} } from './${name}.${suffix}';\n`;
  }

  fs.writeFileSync(`${exportPath}/index.tsx`, content);
}

function isSvg(fileName) {
  return path.extname(fileName) === ".svg";
}

function getIconsFromFolder(options) {
  const { iconPath } = options;

  return fs.readdirSync(iconPath).filter(isSvg);
}

async function getStagedIcons(options) {
  const { iconPath } = options;

  return new Promise((res, rej) =>
    exec("git diff --staged --name-only", (stdin, stdout, stderr) => {
      if (stderr) {
        throw new Error(
          "`git diff` failed, are you in repository? Do you have git binary in PATH?"
        );
      }

      const files = stdout
        .split("\n")
        .filter(
          p => path.resolve(p.trim()).indexOf(iconPath) !== -1 && isSvg(p)
        )
        .map(p => path.basename(p));

      res(files);
    })
  );
}

module.exports = {
  ensurePaths,
  getIconsFromFolder,
  getStagedIcons,
  generateComponent,
  createIndexFile
};
