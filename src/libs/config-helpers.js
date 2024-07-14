import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { rm, symlink } from "node:fs/promises";

export const refreshNodeModules = async () => {
  const brahmaNodeModulesDir = `${process.cwd()}/.brahma/node_modules`;
  const localNodeModulesDir = `${process.cwd()}/node_modules`;
  if (existsSync(localNodeModulesDir)) {
    await rm(localNodeModulesDir, { recursive: true });
  }
  await symlink(brahmaNodeModulesDir, localNodeModulesDir, "dir");
};

export const syncDependenciesWithConfig = async () => {
  const localMayaConfigFile = `${process.cwd()}/maya.config.json`;
  const { packages } = JSON.parse(readFileSync(localMayaConfigFile));
  const localBrahmaPackageJsonFile = `${process.cwd()}/.brahma/package.json`;
  const packageJsonContent = JSON.parse(
    readFileSync(localBrahmaPackageJsonFile)
  );
  const updatedDeps = packages.reduce((deps, pkg) => {
    const splits = pkg.split("::");
    const key = splits[0];
    const value = splits[1];
    deps[key] = value;
    return deps;
  }, {});
  packageJsonContent["dependencies"] = updatedDeps;
  writeFileSync(
    localBrahmaPackageJsonFile,
    JSON.stringify(packageJsonContent, null, 2),
    null,
    2
  );
};

export const syncConfigWithDependencies = async () => {
  const localMayaConfigFile = `${process.cwd()}/maya.config.json`;
  const mayaConfigJsonContent = JSON.parse(readFileSync(localMayaConfigFile));
  const { packages } = mayaConfigJsonContent;
  const localBrahmaPackageJsonFile = `${process.cwd()}/.brahma/package.json`;
  const { dependencies } = JSON.parse(readFileSync(localBrahmaPackageJsonFile));

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
  const updatedPackages = [
    ...packages.filter((pkg) => !removedPackages.includes(pkg)),
    ...addedPackages,
  ];
  mayaConfigJsonContent["packages"] = updatedPackages;
  writeFileSync(
    localMayaConfigFile,
    JSON.stringify(mayaConfigJsonContent, null, 2),
    null,
    2
  );
};

const updateVsCodeConfigWithMayaConfig = (vscodeConfigJson) => {
  const localVSCodeConfigFile = `${process.cwd()}/.vscode/settings.json`;
  writeFileSync(
    localVSCodeConfigFile,
    JSON.stringify(vscodeConfigJson, null, 2),
    null,
    2
  );
};

const updateTsConfigWithMayaConfig = (tsconfigConfigJson) => {
  const localTSConfigFile = `${process.cwd()}/.brahma/tsconfig.json`;
  writeFileSync(
    localTSConfigFile,
    JSON.stringify(tsconfigConfigJson, null, 2),
    null,
    2
  );
};

const updatePackageJsonWithConfig = (appname, packages) => {
  const localBrahmaPackageJsonFile = `${process.cwd()}/.brahma/package.json`;
  const packageJsonContent = JSON.parse(
    readFileSync(localBrahmaPackageJsonFile)
  );

  const updatedDeps = packages.reduce((deps, pkg) => {
    const splits = pkg.split("::");
    const key = splits[0];
    const value = splits[1];
    deps[key] = value;
    return deps;
  }, {});

  packageJsonContent["name"] = appname;
  packageJsonContent["dependencies"] = updatedDeps;
  writeFileSync(
    localBrahmaPackageJsonFile,
    JSON.stringify(packageJsonContent, null, 2),
    null,
    2
  );
};

export const syncConfig = () => {
  const localMayaConfigFile = `${process.cwd()}/maya.config.json`;
  const {
    appname,
    packages,
    vscode: vscodeConfigJson,
    tsconfig: tsconfigConfigJson,
  } = JSON.parse(readFileSync(localMayaConfigFile));

  updateVsCodeConfigWithMayaConfig(vscodeConfigJson);
  updateTsConfigWithMayaConfig(tsconfigConfigJson);
  updatePackageJsonWithConfig(appname, packages);
};
