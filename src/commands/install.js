import { existsSync } from "node:fs";
import { execAsync, syncConfig, refreshNodeModules } from "../libs/index.js";

export const registerInstall = (cli) => {
  cli
    .command("install")
    .description(
      "Installs or updates the configuration and packages based on maya config file"
    )
    .action(async () => {
      syncConfig();
      if (!existsSync(".brahma")) {
        throw new Error(`The sub-directory '.brahma' does not exist or is corrupted.
          \nIf this is a valid Maya app directory, run 'brahma reset' command or create new maya app altogether\n\nError,`);
      }
      const appBrahmaDir = `${process.cwd()}/.brahma`;
      process.chdir(appBrahmaDir);
      await execAsync("bun i");
      process.chdir("../");
      await refreshNodeModules();
    });
};
