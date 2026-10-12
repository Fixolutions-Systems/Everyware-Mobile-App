#!/usr/bin/env node
/**
 * Builds the Astro blog, surviving a Ghost CMS outage.
 *
 * Normal path: `astro build` against live Ghost (or fixtures locally).
 *
 * Fallback: if the build fails *because Ghost could not be reached* (network
 * failure or 5xx after retries) and a committed snapshot exists, ship the
 * snapshot of the last-known-good blog instead of failing the whole deploy.
 * Every other failure - bad API key (4xx), template errors, type errors - still
 * fails loudly, so the "never deploy an empty blog" guarantee is unchanged.
 *
 * Refresh the snapshot with `node scripts/snapshot-blog.mjs`.
 */
import { spawn } from "node:child_process";
import { cp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const blogDist = resolve(root, "apps/blog/dist");
const snapshot = resolve(root, "apps/blog/snapshot");

const GHOST_OUTAGE = /Network failure requesting Ghost|Ghost returned 5\d\d/;

const run = () =>
  new Promise((done) => {
    const child = spawn("npm", ["run", "build", "-w", "apps/blog"], {
      cwd: root,
      shell: true,
      env: process.env,
    });
    let output = "";
    const tee = (stream, sink) =>
      stream.on("data", (chunk) => {
        output += chunk.toString();
        sink.write(chunk);
      });
    tee(child.stdout, process.stdout);
    tee(child.stderr, process.stderr);
    child.on("close", (code) => done({ code: code ?? 1, output }));
  });

const { code, output } = await run();
if (code === 0) process.exit(0);

if (GHOST_OUTAGE.test(output) && existsSync(snapshot)) {
  process.stderr.write(
    "\n" +
      "================================================================\n" +
      " WARNING: Ghost CMS is unreachable. Shipping the committed blog\n" +
      " snapshot (apps/blog/snapshot) instead of live content.\n" +
      " New or edited posts will NOT appear until Ghost is back and the\n" +
      " site is redeployed.\n" +
      "================================================================\n\n",
  );
  await rm(blogDist, { recursive: true, force: true });
  await cp(snapshot, blogDist, { recursive: true });
  process.exit(0);
}

process.exit(code);
