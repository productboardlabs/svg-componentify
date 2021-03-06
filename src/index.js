#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const minimist = require("minimist");
const pkg = require("../package.json");
const {
  log,
  ensurePaths,
  getIconsFromFolder,
  getStagedIcons,
  getXORIcons,
  generateComponent,
  createIndexFile
} = require("./utils");

const DEFAULT_ICON_PATH = null;
const DEFAULT_EXPORT_PATH = null;
const DEFAULT_SUFFIX = "react";
const DEFAULT_EXTENSION = "tsx";
const DEFAULT_NAMING_CONVENTION = 'camelCase'

async function generateIcons(options) {
  const { onlyStaged, all } = options;
  ensurePaths(options);

  const iconsInFolder = getIconsFromFolder(options);

  let iconsToProcess;
  if (all) {
    iconsToProcess = iconsInFolder;
  } else if (onlyStaged) {
    iconsToProcess = await getStagedIcons(options);
  } else {
    iconsToProcess = await getXORIcons(options);
  }

  if (!iconsToProcess.length) {
    log("No icons to process has been found");
  }

  for (icon of iconsToProcess) {
    const path = await generateComponent(icon, options);
  }

  createIndexFile(iconsInFolder, options);

  process.exit(0);
}

const argv = minimist(process.argv.slice(2), {
  string: ["icon-path", "export-path", "extension", "suffix", "naming-convention"],
  boolean: ["version", "only-staged", "force"],
  alias: { v: "version", f: "force" },
  default: {
    "only-staged": false,
    "icon-path": DEFAULT_ICON_PATH,
    "export-path": DEFAULT_EXPORT_PATH,
    extension: DEFAULT_EXTENSION,
    suffix: DEFAULT_SUFFIX,
    "naming-convention": DEFAULT_NAMING_CONVENTION
  }
});

function normalizePath(userPath) {
  return path.resolve(userPath.replace(/^~/, os.homedir()));
}

if (argv["version"]) {
  log(pkg.version);
  return;
}

generateIcons({
  onlyStaged: !!argv["only-staged"],
  all: !!argv["all"],
  iconPath: normalizePath(argv["icon-path"]),
  exportPath: normalizePath(argv["export-path"]),
  extension: argv["extension"],
  suffix: argv["suffix"],
  force: argv["force"],
  namingConvention: argv["naming-convention"]
});
