#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const minimist = require("minimist");
const {
  ensurePaths,
  getIconFromFolder,
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

  const iconsInFolder = getIconFromFolder(options);

  let iconsToProcess = onlyStaged
    ? await getStagedIcons(options)
    : iconsInFolder;

  if (!iconsToProcess.length) {
    console.log("No icons found");
  }

  for (icon of iconsToProcess) {
    const path = await generateComponent(icon, options);
  }

  createIndexFile(iconsInFolder, options);

  process.exit(0);
}

const argv = minimist(process.argv.slice(2), {
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

generateIcons({
  onlyStaged: !!argv["only-staged"],
  iconPath: normalizePath(argv["icon-path"]),
  exportPath: normalizePath(argv["export-path"]),
  extension: argv["extension"],
  suffix: argv["suffix"]
});
