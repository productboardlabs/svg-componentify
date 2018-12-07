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

const DEFAULT_ICON_PATH = "./icons";
const DEFAULT_EXPORT_PATH = "./components/icon";
const DEFAULT_SUFFIX = "react";
const DEFAULT_EXTENSION = "tsx";

async function generateIcons(options) {
  const { onlyStaged } = options;
  ensurePaths(options);

  let icons = onlyStaged
    ? await getStagedIcons(options)
    : getIconFromFolder(options);

  if (!icons.length) {
    console.log("No icons found");
  }

  for (icon of icons) {
    const path = await generateComponent(icon, options);
  }

  createIndexFile(icons, options);

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

function normalizePath(path) {
  return path.replace(/^~/, os.homedir());
}

generateIcons({
  onlyStaged: !!argv["only-staged"],
  iconPath: normalizePath(argv["icon-path"]),
  exportPath: normalizePath(argv["export-path"]),
  extension: argv["extension"],
  suffix: argv["suffix"]
});
