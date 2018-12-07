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

  console.log(exportPath);
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

function getComponentNameFromFileName(file) {
  const name = file.split(".")[0];

  let camelSized = camelcase(name);

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
  console.log(`Processing ${iconName}`);
  let write = true;

  const componentName = getComponentNameFromFileName(iconName);

  // check if file already exists
  if (fs.existsSync(`${exportPath}/${componentName}.${suffix}.${extension}`)) {
    const rl = readline.createInterface(process.stdin, process.stdout);
    // ask user what to do
    write = await new Promise(res =>
      rl.question("Overwrite? [n]/y: ", function(answer) {
        if (answer === "y") {
          console.log("Rewriting...");
          return res(true);
        }

        res(false);
      })
    );
    rl.close();
  }

  if (!write) {
    console.log(`Generating ${iconName} skipped!`);
    return;
  }

  console.log(`Generating ${iconName}`);

  const file = fs.readFileSync(`${iconPath}/${iconName}`);
  const svgCode = file.toString();

  const componentDestinationPath = `${exportPath}/${componentName}.${suffix}.${extension}`;
  const componentCode = await getComponentCode(svgCode, componentName);

  fs.writeFileSync(componentDestinationPath, componentCode);

  return componentDestinationPath;
}

function createIndexFile(icons, options) {
  const { exportPath, suffix } = options;
  let content = "";

  for (icon of icons) {
    name = getComponentNameFromFileName(icon);

    content += `export {default as ${name}} from './${name}.${suffix}'\n`;
  }

  fs.writeFileSync(`${exportPath}/index.tsx`, content);
}

function getIconFromFolder(options) {
  const { iconPath } = options;

  return fs.readdirSync(iconPath);
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
        .map(a => `./${a.trim()}`)
        .filter(p => p.indexOf(iconPath) !== -1)
        .map(p => path.basename(p));

      res(files);
    })
  );
}

module.exports = {
  ensurePaths,
  getIconFromFolder,
  getStagedIcons,
  generateComponent,
  createIndexFile
};
