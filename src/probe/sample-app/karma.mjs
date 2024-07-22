const APP_NAME = "my-first-maya-app";
const APP_SRC_DIRNAME = "app";
const STAGING_DIRNAME = "stage";
const PUBLISH_DIRNAME = "public";
const TS_GLOBALS_FILENAME = "global.d.ts";

// DO NOT TOUCH (ONLY) THE NEXT LINE
const config = {
  // you can edit below lines the way you want
  vscode: {
    "files.exclude": {
      ".brahma": true,
      ".gitignore": true,
      node_modules: true,
      "tsconfig.json": true,
      [TS_GLOBALS_FILENAME]: true,
      [STAGING_DIRNAME]: true,
      [PUBLISH_DIRNAME]: true,
    },
  },
  brahma: {
    appDir: APP_SRC_DIRNAME,
    stagingDir: STAGING_DIRNAME,
    publishDir: PUBLISH_DIRNAME,
  },
  npm: {
    appname: APP_NAME,
    packages: [
      "@ckzero/maya::npm:@jsr/ckzero__maya@^0.1.0",
      "@ckzero/value-utils::npm:@jsr/ckzero__value-utils@^0.1.0",
    ],
  },
  tsconfig: {
    compilerOptions: {
      lib: ["ESNext", "DOM"],
      target: "ESNext",
      module: "ESNext",
      moduleDetection: "force",
      allowJs: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      noFallthroughCasesInSwitch: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noPropertyAccessFromIndexSignature: true,
      rootDirs: ["./", `../${APP_SRC_DIRNAME}`],
      baseUrl: "../",
    },
    include: [`../${APP_SRC_DIRNAME}/**/*.ts`, `${TS_GLOBALS_FILENAME}`],
  },
};

// DO NOT TOUCH (ONLY) THE NEXT LINE
export default config;
