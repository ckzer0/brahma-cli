import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import {
  execAsync,
  getPath,
  installKarma,
  syncNodeModulesSymlink,
} from "../libs/index.js";

const copyBaseFiles = async () => {
  const probeVSCodeConfigDir = getPath("../probe/base-files");
  const localVSCodeConfigDir = `${process.cwd()}`;
  await cp(probeVSCodeConfigDir, localVSCodeConfigDir, { recursive: true });
};

export const registerInstall = (cli) => {
  cli
    .command("install")
    .description(
      "Installs or updates the configuration and packages based on karma config file"
    )
    .action(async () => {
      if (!existsSync(".brahma")) {
        await copyBaseFiles();
      }
      await installKarma();
      const appBrahmaDir = `${process.cwd()}/.brahma`;
      process.chdir(appBrahmaDir);
      console.log("Running 'brahma install'.\nInstalling packages...");
      await execAsync("bun i");
      process.chdir("../");
      await syncNodeModulesSymlink();
      await execAsync("brahma stage");
    });
};
