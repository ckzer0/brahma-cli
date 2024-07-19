import { createDirIfNotExists, execAsync } from "../libs/index.js";

export const registerCreate = (cli) => {
  cli
    .command("create <appName>")
    // .description(
    //   "Initializes files of new maya app or reset files to inital state"
    // )
    .description("Creates a new maya app")
    .action(async (appName) => {
      await createDirIfNotExists(appName);
      const appDir = `${process.cwd()}/${appName}`;
      process.chdir(appDir);
      await execAsync("brahma init");
      await execAsync("brahma install");
      process.chdir("../");
      console.log(`App created in '${process.cwd()}/${appName}' directory
      \n1. Run below commands to start development
      - run 'cd ${appName}' to go to the app directory
      - run 'code .' to open app directory in VS Code
      - run 'brahma stage' (in any terminal, VSCode or external) to build the app in dev mode  
      \n2. Open the app in VSCode
      \n3. At VSCode bottombar, click 'Go Live' button to run the Live Server extension
      \n4. When the app opens in browser, click on 'stage' to open the app
      \n\nHappy hacking :)
      `);
    });
};
