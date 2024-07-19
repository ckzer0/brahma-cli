import { copyFile, cp } from "node:fs/promises";
import { getPath } from "../libs/index.js";

const copyInitialStateFiles = async () => {
  const probeMayaConfigDir = getPath("../probe/maya.config.json");
  const localMayaConfigDir = `${process.cwd()}/maya.config.json`;
  await cp(probeMayaConfigDir, localMayaConfigDir, { recursive: true });

  const probeVSCodeConfigDir = getPath("../probe/vscode");
  const localVSCodeConfigDir = `${process.cwd()}/.vscode`;
  await cp(probeVSCodeConfigDir, localVSCodeConfigDir, { recursive: true });

  const probeBrahmaDir = getPath("../probe/brahma");
  const localBrahmaDir = `${process.cwd()}/.brahma`;
  await cp(probeBrahmaDir, localBrahmaDir, { recursive: true });

  const probeNpmrcDir = getPath("../probe/npmrc.txt");
  const localNpmrcDir = `${process.cwd()}/.brahma/.npmrc`;
  await copyFile(probeNpmrcDir, localNpmrcDir);

  const probeGitIgnoreFile = getPath("../probe/gitignore.txt");
  const localGitIgnoreFile = `${process.cwd()}/.gitignore`;
  await copyFile(probeGitIgnoreFile, localGitIgnoreFile);
};

export const registerReset = (cli) => {
  cli
    .command("reset")
    .description("Resets files to inital state")
    .action(async () => {
      console.log(`(Over)writing initialization files...`);
      await copyInitialStateFiles();
      process.chdir("../");
      console.log(`App reset to initial state.
      - run 'brahma install' to install dependencies`);
    });
};
