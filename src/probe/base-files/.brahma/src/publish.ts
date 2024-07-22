import { buildApp } from "./build";
import { ROOT_DIR } from "./common";

const BUILD_SRC_DIR = `${ROOT_DIR}/app`;
const BUILD_DEST_DIR = `${ROOT_DIR}/public`;
buildApp(BUILD_SRC_DIR, BUILD_DEST_DIR);
