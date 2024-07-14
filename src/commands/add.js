import { existsSync } from "node:fs";
import {
  execAsync,
  refreshNodeModules,
  syncConfigWithDependencies,
} from "../libs/index.js";

export const registerAddPackage = (cli) => {
  cli
    .command("add")
    .argument("<packageName>", "npm package name to be added to the maya app")
    .description("adds an npm package to be used in the app")
    .action(async (packageName) => {
      if (!existsSync(".brahma")) {
        throw new Error(`The sub-directory '.brahma' does not exist or is corrupted.
          \nIf this is a valid Maya app directory, run 'brahma reset' command or create new maya app altogether\n\nError,`);
      }
      const appBrahmaDir = `${process.cwd()}/.brahma`;
      process.chdir(appBrahmaDir);
      await execAsync(`npx bun add ${packageName}`);
      process.chdir("../");
      await syncConfigWithDependencies();
      await refreshNodeModules();
    });
};
