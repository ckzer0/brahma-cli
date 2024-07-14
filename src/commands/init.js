import { copyFile, cp } from "node:fs/promises";
import { getPath } from "../libs/index.js";

const generateFiles = async () => {
  const probeVSCodeConfigDir = getPath("../probe/vscode");
  const localVSCodeConfigDir = `${process.cwd()}/.vscode`;
  await cp(probeVSCodeConfigDir, localVSCodeConfigDir, { recursive: true });

  const probeBrahmaDir = getPath("../probe/brahma");
  const localBrahmaDir = `${process.cwd()}/.brahma`;
  await cp(probeBrahmaDir, localBrahmaDir, { recursive: true });

  const probeGitIgnoreFile = getPath("../probe/gitignore.txt");
  const localGitIgnoreFile = `${process.cwd()}/.gitignore`;
  await copyFile(probeGitIgnoreFile, localGitIgnoreFile);
};

export const registerInit = (cli) => {
  cli
    .command("init")
    .description(
      "Initializes files of new maya app or reset files to inital state"
    )
    .action(async () => {
      const appDir = `${process.cwd()}`;
      process.chdir(appDir);
      await generateFiles();
      process.chdir("../");
      console.log(`App initialized in ${appDir}`);
    });
};
