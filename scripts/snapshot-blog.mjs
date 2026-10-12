#!/usr/bin/env node
/**
 * Captures the currently-live blog into apps/blog/snapshot/.
 *
 * Why this exists: `scripts/build-blog.mjs` falls back to this snapshot when
 * the Ghost CMS is unreachable at build time, so a CMS outage cannot block a
 * deploy of the marketing site. Refresh it whenever blog content changes:
 *
 *   node scripts/snapshot-blog.mjs [origin]
 *
 * It only stores files the blog owns (/blog*, /_astro/*, robots, sitemap), so
 * it can never collide with the React site in merge-dist.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const origin = (process.argv[2] ?? "https://everyware.in").replace(/\/$/, "");
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../apps/blog/snapshot");

const get = async (path) => {
  const res = await fetch(origin + path, { redirect: "follow" });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
};

const save = async (rel, buf) => {
  const file = join(out, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);
  process.stdout.write(`  + ${rel}\n`);
};

/** /blog -> blog.html, /blog/x/y -> blog/x/y.html (matches Astro's file output). */
const htmlPathFor = (urlPath) => `${urlPath.replace(/^\/|\/$/g, "")}.html`;

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const sitemap = (await get("/sitemap.xml"))?.toString("utf8");
if (!sitemap) throw new Error(`Could not read ${origin}/sitemap.xml`);
await save("sitemap.xml", Buffer.from(sitemap));

const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => p === "/blog" || p.startsWith("/blog/"));

const assets = new Set();
for (const page of new Set(pages)) {
  const buf = await get(page);
  if (!buf) throw new Error(`Live page missing: ${page}`);
  await save(htmlPathFor(page), buf);
  for (const m of buf.toString("utf8").matchAll(/(?:href|src)="(\/_astro\/[^"?#]+)"/g)) {
    assets.add(m[1]);
  }
}

// Assets referenced from CSS (fonts, images) live next to the CSS under /_astro.
const queue = [...assets];
while (queue.length) {
  const asset = queue.pop();
  const buf = await get(asset);
  if (!buf) throw new Error(`Live asset missing: ${asset}`);
  await save(asset.slice(1), buf);
  if (asset.endsWith(".css")) {
    for (const m of buf.toString("utf8").matchAll(/url\((?:"|')?(\/_astro\/[^)"'?#]+)/g)) {
      if (!assets.has(m[1])) {
        assets.add(m[1]);
        queue.push(m[1]);
      }
    }
  }
}

const robots = await get("/robots.txt");
if (robots) await save("robots.txt", robots);
const notFound = await get("/404.html");
if (notFound && !notFound.toString("utf8").includes("<div id=\"root\"")) await save("404.html", notFound);

process.stdout.write(`\nSnapshot of ${origin}: ${String(pages.length)} page(s), ${String(assets.size)} asset(s).\n`);
