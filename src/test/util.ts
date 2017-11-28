import * as mkdirp from "mkdirp";
import * as path from "path";

export const rootDir = path.resolve(__dirname, process.cwd());
export const outputDir = path.join(rootDir, "output");
export const file = path.join(outputDir, `lock.txt`);
export const fileData = "some file data";
export const lockTime = 8 * 1000;

export const waitPromise = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));

export const nowMs = () => Number(new Date());

mkdirp.sync(outputDir);
