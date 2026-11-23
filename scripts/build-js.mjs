// Generates JavaScript (.jsx/.js) copies of every TypeScript component, demo,
// block and lib file, so the docs can offer both. Types are stripped with
// Sucrase, then the result is formatted with Prettier so it reads like
// hand-written code. Output: src/registry/__generated__/js (git-ignored).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "sucrase";
import prettier from "prettier";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/registry/__generated__/js");
const config = (await prettier.resolveConfig(path.join(root, "package.json"))) ?? {};

const sets = [
  { from: "src/registry/ui", to: "ui" },
  { from: "src/registry/demos", to: "demos" },
  { from: "src/blocks", to: "blocks" },
  { from: "src/lib", to: "lib", only: ["utils.ts", "hooks.ts", "clipboard.ts"] },
];

const toJs = async (code, file) => {
  const stripped = transform(code, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "preserve",
    disableESTransforms: true,
    production: true,
    filePath: file,
  }).code;
  return prettier.format(stripped, { ...config, parser: "babel" });
};

let count = 0;
for (const set of sets) {
  const src = path.join(root, set.from);
  const dest = path.join(out, set.to);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (!/\.tsx?$/.test(name) || name.endsWith(".d.ts")) continue;
    if (set.only && !set.only.includes(name)) continue;
    const code = fs.readFileSync(path.join(src, name), "utf8");
    const js = await toJs(code, name);
    fs.writeFileSync(path.join(dest, name.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js")), js);
    count++;
  }
}
console.log(`build-js: wrote ${count} JavaScript files`);
