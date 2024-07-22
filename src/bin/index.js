#! /usr/bin/env node

import { Command } from "commander";
import {
  registerAddPackage,
  registerAnythingElse,
  registerCreate,
  registerInstall,
  registerRemovePackage,
  registerStage,
} from "../commands/index.js";

// Declare the program
const cli = new Command();

// Register commands to the CLI
registerCreate(cli);
registerInstall(cli);
registerStage(cli);
registerAddPackage(cli);
registerRemovePackage(cli);
registerAnythingElse(cli);

// Execute the CLI witht the given arguments
cli.parse(process.argv);
