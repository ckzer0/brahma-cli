import { watch } from "fs";
import { reBuildApp } from "./build";

const WATCH_PATH = "../app";

await reBuildApp();
const watcher = watch(
  WATCH_PATH,
  {
    recursive: true,
  },
  async (event, filename) => {
    console.log(`\n\nDetected ${event} in ${filename}\n\n`);
    await reBuildApp();
  }
);

process.on("SIGINT", () => {
  // close watcher when Ctrl-C is pressed
  console.log("\nClosing watcher...");
  watcher?.close();
  process.exit(0);
});
