import { generateStaticHtml, getDefaultHtml } from "@ckzero/maya/web";
import { readdir, lstat, rmdir, exists } from "fs/promises";
import bun from "bun";

let buildCallCounter = 0;
let buildSrcDir: string;
let buildDestDir: string;

const HTML_FILE_SRC = "app.ts";
const HTML_FILE_DEST = "index.html";
const JS_FILE_SRC = "main.ts";
const JS_FILE_DEST = "main.js";

const NO_HTML_ERROR = "no html";
const NO_JS_ERROR = "no js";

export const getJoinedPath = (rootDir: string, relativePath: string) =>
  `${rootDir}/${relativePath}`.replace("//", "/");

const getFilesAndFolders = async (
  currentRelativePath: string
): Promise<{
  files: string[];
  folders: string[];
}> => {
  const currentFullPath = getJoinedPath(buildSrcDir, currentRelativePath);
  const allFiles = await readdir(currentFullPath);
  const files: string[] = [];
  const folders: string[] = [];

  for await (const fileOrFolder of allFiles) {
    if (fileOrFolder.charAt(0) === "_") continue;

    const childFullPath = getJoinedPath(currentFullPath, fileOrFolder);
    const fileIsDir = (await lstat(childFullPath)).isDirectory();

    if (fileIsDir) folders.push(fileOrFolder);
    else files.push(fileOrFolder);
  }

  return { files, folders };
};

const buildHtml = async (htmlSrc: string, htmlDest: string) => {
  console.log(`building ${htmlSrc} -> ${htmlDest}`);
  const { app } = await import(htmlSrc);
  const appOuterHtml = generateStaticHtml(app);
  const html = getDefaultHtml(appOuterHtml);
  if (!html) throw new Error(NO_HTML_ERROR);

  await bun.write(htmlDest, html);
};

const buildJs = async (jsSrc: string, jsDest: string, destDir: string) => {
  const jsBuild = await bun.build({
    entrypoints: [jsSrc],
    outdir: destDir,
    splitting: true,
  });
  const js = await jsBuild.outputs.map(async (o) => await o.text())[0];
  if (!js) {
    console.log(jsBuild);
    throw new Error(NO_JS_ERROR);
  }

  await bun.write(jsDest, js);
};

const buildFiles = async (relativePath: string, files: string[]) => {
  const srcDir = getJoinedPath(buildSrcDir, relativePath);
  const destDir = getJoinedPath(buildDestDir, relativePath);

  const re = /(?:\.([^.]+))?$/;
  for await (const file of files) {
    if (file === HTML_FILE_SRC) {
      const htmlSrc = getJoinedPath(srcDir, HTML_FILE_SRC);
      const htmlDest = getJoinedPath(destDir, HTML_FILE_DEST);
      await buildHtml(htmlSrc, htmlDest);
      continue;
    }

    if (file === JS_FILE_SRC) {
      const jsSrc = getJoinedPath(srcDir, JS_FILE_SRC);
      const jsDest = getJoinedPath(destDir, JS_FILE_DEST);
      await buildJs(jsSrc, jsDest, destDir);
      continue;
    }

    const ext = re.exec(file)?.[1];
    if (ext === "ts") continue;

    const fileSrc = getJoinedPath(srcDir, file);
    const fileDest = getJoinedPath(destDir, file);

    const content = await bun.file(fileSrc).text();
    await bun.write(fileDest, content);
  }
};

const buildFolder = async (currentRelativePath: string) => {
  if (currentRelativePath === "") {
    console.log(`\nbuild called ${++buildCallCounter} times\n`);
  }
  const { files, folders } = await getFilesAndFolders(currentRelativePath);

  await buildFiles(currentRelativePath, files);

  for await (const folder of folders) {
    const childRelativePath = getJoinedPath(currentRelativePath, folder);
    buildFolder(childRelativePath);
  }
};

export const buildApp = async (
  buildSrcDirectory: string,
  buildDestDirectory: string
) => {
  buildSrcDir = buildSrcDirectory;
  buildDestDir = buildDestDirectory;
  const destExists = await exists(buildDestDir);
  if (destExists) {
    console.log(`\nRemoving ${buildDestDir}\n`);
    await rmdir(buildDestDir, { recursive: true });
    const stillExists = await exists(buildDestDir);
    if (stillExists) throw new Error(`Failed to remove ${buildDestDir}`);
  }
  await buildFolder("");
};