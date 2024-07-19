import { cp } from "node:fs/promises";
import { execAsync, getPath } from "../libs/index.js";

const populateAppDirectory = async () => {
  const probeAppDir = getPath("../probe/sample-app");
  const localAppDir = `${process.cwd()}/app`;
  await cp(probeAppDir, localAppDir, { recursive: true });
};

export const registerInit = (cli) => {
  cli
    .command("init")
    .description("Initializes files of new maya app.")
    .action(async () => {
      console.log(`Populating sample app directory...`);
      await populateAppDirectory();
      await execAsync("brahma reset");
      console.log(`App initialized.`);
    });
};
