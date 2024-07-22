import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { rm, symlink } from "node:fs/promises";

const KARMA_FILE_SPLITTER = "// DO NOT TOUCH (ONLY) THE NEXT LINE";

export const syncNodeModulesSymlink = async () => {
  const brahmaNodeModulesDir = `${process.cwd()}/.brahma/node_modules`;
  const localNodeModulesDir = `${process.cwd()}/node_modules`;
  if (existsSync(localNodeModulesDir)) {
    await rm(localNodeModulesDir, { recursive: true });
  }
  await symlink(brahmaNodeModulesDir, localNodeModulesDir, "dir");
};

export const syncKarmaWithNpmDeps = async () => {
  const localKarmaFile = `${process.cwd()}/karma.mjs`;
  const localKarmaFileContent = readFileSync(localKarmaFile, "utf8");
  const localKarmaConfig = await import(localKarmaFile);
  const {
    npm: { packages },
  } = localKarmaConfig.default;
  const localNpmPackageJsonFile = `${process.cwd()}/.brahma/package.json`;
  const { dependencies } = JSON.parse(readFileSync(localNpmPackageJsonFile));

  const addedPackages = [];
  const removedPackages = [];

  Object.entries(dependencies).forEach(([key, value]) => {
    const configPackage = `${key}::${value}`;

    if (!packages.includes(configPackage)) {
      addedPackages.push(configPackage);
    }
  });

  packages.forEach((pkg) => {
    const key = pkg.split("::")[0];

    if (!dependencies[key]) {
      removedPackages.push(pkg);
    }
  });
  const updatedKarmaConfig = {
    ...localKarmaConfig,
    npm: {
      ...localKarmaConfig.npm,
      packages: [
        ...packages.filter((pkg) => !removedPackages.includes(pkg)),
        ...addedPackages,
      ],
    },
  };

  const splits = localKarmaFileContent.split(KARMA_FILE_SPLITTER);
  const oldConfigContent = splits[0] + "@@" + splits[2];
  const updatedKarmaFileContent = oldConfigContent.replace(
    "@@",
    `const config = ${JSON.stringify(updatedKarmaConfig, null, 2)};`
  );
  writeFileSync(localKarmaFile, updatedKarmaFileContent, null, 2);
};

const installVsCodeConfig = (karmaVsCodeConfig) => {
  const localVSCodeConfigFile = `${process.cwd()}/.vscode/settings.json`;
  writeFileSync(
    localVSCodeConfigFile,
    JSON.stringify(karmaVsCodeConfig, null, 2),
    null,
    2
  );
};

const installTsConfig = (karmaTsConfig) => {
  const localTSConfigFile = `${process.cwd()}/.brahma/tsconfig.json`;
  writeFileSync(
    localTSConfigFile,
    JSON.stringify(karmaTsConfig, null, 2),
    null,
    2
  );
};

const installNpmPackageJson = (karmaNpmConfig) => {
  const { appname, packages } = karmaNpmConfig;
  const localNpmPackageJsonFile = `${process.cwd()}/.brahma/package.json`;
  const localPackageJsonContent = JSON.parse(
    readFileSync(localNpmPackageJsonFile)
  );

  const updatedDeps = packages.reduce((deps, pkg) => {
    const splits = pkg.split("::");
    const key = splits[0];
    const value = splits[1];
    deps[key] = value;
    return deps;
  }, {});

  localPackageJsonContent["name"] = appname;
  localPackageJsonContent["dependencies"] = updatedDeps;
  writeFileSync(
    localNpmPackageJsonFile,
    JSON.stringify(localPackageJsonContent, null, 2),
    null,
    2
  );
};

export const installKarma = async () => {
  const localKarmaFile = `${process.cwd()}/karma.mjs`;
  const localKarmaConfig = await import(localKarmaFile);
  const {
    npm: karmaNpmConfig,
    vscode: karmaVsCodeConfig,
    tsconfig: karmaTsConfig,
  } = localKarmaConfig.default;

  installVsCodeConfig(karmaVsCodeConfig);
  installTsConfig(karmaTsConfig);
  installNpmPackageJson(karmaNpmConfig);
};
