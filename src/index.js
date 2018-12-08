#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const minimist = require("minimist");
const pkg = require("../package.json");
const {
  ensurePaths,
  getIconsFromFolder,
  getStagedIcons,
  generateComponent,
  createIndexFile
} = require("./utils");

const DEFAULT_ICON_PATH = null;
const DEFAULT_EXPORT_PATH = null;
const DEFAULT_SUFFIX = "react";
const DEFAULT_EXTENSION = "tsx";

async function generateIcons(options) {
  const { onlyStaged } = options;
  ensurePaths(options);

  const iconsInFolder = getIconsFromFolder(options);

  let iconsToProcess = onlyStaged
    ? await getStagedIcons(options)
    : iconsInFolder;

  if (!iconsToProcess.length) {
    console.log("No icons to process has been found");
  }

  for (icon of iconsToProcess) {
    const path = await generateComponent(icon, options);
  }

  createIndexFile(iconsInFolder, options);

  process.exit(0);
}

const argv = minimist(process.argv.slice(2), {
  string: ["icon-path", "export-path", "extension", "suffix"],
  boolean: ["version", "only-staged"],
  alias: { v: "version" },
  default: {
    "only-staged": false,
    "icon-path": DEFAULT_ICON_PATH,
    "export-path": DEFAULT_EXPORT_PATH,
    extension: DEFAULT_EXTENSION,
    suffix: DEFAULT_SUFFIX
  }
});

function normalizePath(userPath) {
  return path.resolve(userPath.replace(/^~/, os.homedir()));
}

if (argv["version"]) {
  console.log(pkg.version);
  return;
}

generateIcons({
  onlyStaged: !!argv["only-staged"],
  iconPath: normalizePath(argv["icon-path"]),
  exportPath: normalizePath(argv["export-path"]),
  extension: argv["extension"],
  suffix: argv["suffix"]
});
