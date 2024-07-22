import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { copyFile, rename, rm, symlink } from "node:fs/promises";

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
  const currentKarmaFile = `${process.cwd()}/karma.mjs`;
  const currentKarmaFileContent = readFileSync(currentKarmaFile, "utf8");
  const currentKarmaConfig = await import(currentKarmaFile);
  const {
    npm: { packages },
  } = currentKarmaConfig.default;
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
    ...currentKarmaConfig,
    npm: {
      ...currentKarmaConfig.npm,
      packages: [
        ...packages.filter((pkg) => !removedPackages.includes(pkg)),
        ...addedPackages,
      ],
    },
  };

  const splits = currentKarmaFileContent.split(KARMA_FILE_SPLITTER);
  const oldConfigContent = splits[0] + "@@" + splits[2];
  const updatedKarmaFileContent = oldConfigContent.replace(
    "@@",
    `const config = ${JSON.stringify(updatedKarmaConfig, null, 2)};`
  );
  writeFileSync(currentKarmaFile, updatedKarmaFileContent, null, 2);
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

const installGitConfig = (karmaGitConfig) => {
  const localGitIgnoreFile = `${process.cwd()}/.gitignore`;
  const gitIgnoreContent = karmaGitConfig.ignoreList
    .reverse()
    .reduce((content, item) => {
      return `${item}\n${content}`;
    }, "");
  writeFileSync(localGitIgnoreFile, gitIgnoreContent, null, 2);
};

const installBrahmaConfig = async (
  oldKarmaBrahmaConfig,
  newKarmaBrahmaConfig
) => {
  console.log(oldKarmaBrahmaConfig);
  console.log(newKarmaBrahmaConfig);
  const localStageTsFile = `${process.cwd()}/.brahma/src/stage.ts`;
  const rawStageTsFileContent = readFileSync(localStageTsFile, "utf8");
  const localPublishTsFile = `${process.cwd()}/.brahma/src/publish.ts`;
  const rawPublishTsFileContent = readFileSync(localPublishTsFile, "utf8");
  const {
    srcDir: prevSrcDir,
    stagingDir: prevStagingDir,
    publishDir: prevPublishDir,
  } = oldKarmaBrahmaConfig;
  const {
    srcDir: newSrcDir,
    stagingDir: newStagingDir,
    publishDir: newPublishDir,
  } = newKarmaBrahmaConfig;

  const filledStageTsFileContent = rawStageTsFileContent
    .replace(
      "const BUILD_SRC_DIR = `${ROOT_DIR}/" + prevSrcDir + "`;",
      "const BUILD_SRC_DIR = `${ROOT_DIR}/" + newSrcDir + "`;"
    )
    .replace(
      "const BUILD_DEST_DIR = `${ROOT_DIR}/" + prevStagingDir + "`;",
      "const BUILD_DEST_DIR = `${ROOT_DIR}/" + newStagingDir + "`;"
    );
  const filledPublishTsFileContent = rawPublishTsFileContent
    .replace(
      "const BUILD_SRC_DIR = `${ROOT_DIR}/" + prevSrcDir + "`;",
      "const BUILD_SRC_DIR = `${ROOT_DIR}/" + newSrcDir + "`;"
    )
    .replace(
      "const BUILD_DEST_DIR = `${ROOT_DIR}/" + prevPublishDir + "`;",
      "const BUILD_DEST_DIR = `${ROOT_DIR}/" + newPublishDir + "`;"
    );
  writeFileSync(localStageTsFile, filledStageTsFileContent, null, 2);
  writeFileSync(localPublishTsFile, filledPublishTsFileContent, null, 2);

  const prevSrcDirPath = `${process.cwd()}/${prevSrcDir}`;
  const prevStagingDirPath = `${process.cwd()}/${prevStagingDir}`;
  const prevPublishDirPath = `${process.cwd()}/${prevPublishDir}`;

  const newSrcDirPath = `${process.cwd()}/${newSrcDir}`;
  const newStagingDirPath = `${process.cwd()}/${newStagingDir}`;
  const newPublishDirPath = `${process.cwd()}/${newPublishDir}`;

  if (existsSync(prevSrcDirPath)) {
    console.log("prevSrcDirPath", prevSrcDirPath);
    console.log("newSrcDirPath", newSrcDirPath);
    await rename(prevSrcDirPath, newSrcDirPath);
  }

  if (existsSync(prevStagingDirPath)) {
    await rename(prevStagingDirPath, newStagingDirPath);
  }

  if (existsSync(prevPublishDirPath)) {
    await rename(prevPublishDirPath, newPublishDirPath);
  }
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
  const oldKarmaFile = `${process.cwd()}/.brahma/old-karma.mjs`;
  const oldKarmaConfig = await import(oldKarmaFile);
  const { brahma: oldKarmaBrahmaConfig } = oldKarmaConfig.default;
  const currentKarmaFile = `${process.cwd()}/karma.mjs`;
  const currentKarmaConfig = await import(currentKarmaFile);
  const {
    vscode: karmaVsCodeConfig,
    tsconfig: karmaTsConfig,
    git: karmaGitConfig,
    brahma: newKarmaBrahmaConfig,
    npm: karmaNpmConfig,
  } = currentKarmaConfig.default;

  installVsCodeConfig(karmaVsCodeConfig);
  installTsConfig(karmaTsConfig);
  installGitConfig(karmaGitConfig);
  await installBrahmaConfig(oldKarmaBrahmaConfig, newKarmaBrahmaConfig);
  installNpmPackageJson(karmaNpmConfig);
  await copyFile(currentKarmaFile, oldKarmaFile);
};
