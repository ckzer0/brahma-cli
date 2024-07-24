import { existsSync } from "node:fs";
import { execAsync } from "../libs/index.js";

export const registerStage = (cli) => {
  cli
    .command("stage")
    .description("Builds the app in 'stage' mode for dev and testing")
    .action(async () => {
      if (!existsSync(".brahma")) {
        throw new Error(`The sub-directory '.brahma' does not exist or is corrupted.
          \nIf this is a valid Maya app directory, run 'brahma reset' command or create new maya app altogether\n\nError,`);
      }
      const appBrahmaDir = `${process.cwd()}/.brahma`;
      process.chdir(appBrahmaDir);
      console.log(
        `App is staged for dev and testing.
        - Make sure below VS Code extensions are installed,
            • 'Live Server' (ritwickdey.LiveServer)
            • 'Run on Save' (emeraldwalk.RunOnSave)
        - click on 'Go Live' button at bottom of VSCode
        - the app is being served on http://127.0.0.1:[port_number]\n`
      );
      await execAsync("bun run stage");
      process.chdir("../");
    });
};
