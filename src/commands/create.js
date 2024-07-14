import { cp } from "node:fs/promises";
import { createDirIfNotExists, execAsync, getPath } from "../libs/index.js";

const copyProbeToAppDir = async () => {
  const probeVSCodeConfigDir = getPath("../probe/maya.config.json");
  const localVSCodeConfigDir = `${process.cwd()}/maya.config.json`;
  await cp(probeVSCodeConfigDir, localVSCodeConfigDir, { recursive: true });

  const probeAppDir = getPath("../probe/sample-app");
  const localAppDir = `${process.cwd()}/app`;
  await cp(probeAppDir, localAppDir, { recursive: true });
};

export const registerCreate = (cli) => {
  cli
    .command("create <appName>")
    .description("Creates a new maya app")
    .action(async (appName) => {
      await createDirIfNotExists(appName);
      const appDir = `${process.cwd()}/${appName}`;
      process.chdir(appDir);
      await copyProbeToAppDir();
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
