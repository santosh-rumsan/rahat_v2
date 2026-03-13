#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(resolve(__dirname, "../dev.config.json"), "utf-8"),
);

const active = config.active;
if (!active || active.length === 0) {
  console.error("No active packages in dev.config.json");
  process.exit(1);
}

const filters = active.map((pkg) => `--filter=${pkg}`).join(" ");
const concurrency = active.length + 1;

console.log(`Starting dev for: ${active.join(", ")}`);
execSync(`turbo watch dev --continue --concurrency=${concurrency} ${filters}`, {
  stdio: "inherit",
});
