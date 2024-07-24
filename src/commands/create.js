import { cp } from "node:fs/promises";
import { createDirIfNotExists, execAsync, getPath } from "../libs/index.js";

const copySampleApp = async () => {
  const probeAppDir = getPath("../probe/sample-app");
  const localAppDir = `${process.cwd()}`;
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
      await copySampleApp();
      await execAsync("brahma install");
      process.chdir("../");
      console.log(`App created in '${process.cwd()}/${appName}' directory
      \n1. Open the app in VSCode
      \n2. Make sure below VS Code extensions are installed,
      • 'Live Server' (ritwickdey.LiveServer)
      • 'Run on Save' (emeraldwalk.RunOnSave)
      \n3. If you are installing extensions just now, run 'brahma stage' command after installation
      \n4. At VSCode bottombar, click 'Go Live' button to run the Live Server extension
      \n5. The app is being served on http://127.0.0.1:[port_number]
      \n\nHappy hacking :)
      `);
    });
};
