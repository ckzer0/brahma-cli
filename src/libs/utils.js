import { exec as nodeExec } from "node:child_process";
import util from "node:util";

const execute = util.promisify(nodeExec);

export const execAsync = async (shellCommand) => {
  try {
    const { stdout, stderr } = await execute(shellCommand);
    console.log(stdout);
    console.error(stderr);
  } catch (err) {
    console.log(err);
  }
};
