// Reads every component's TypeScript source and writes its API (props, types,
// defaults, descriptions) to src/registry/__generated__/api.json, so the docs'
// props tables can never drift from the code.
//
// Uses the TypeScript 5 compiler API (the "ts5" dev dependency): TypeScript 7's
// native compiler has no JavaScript API yet. Parsing only; no type checking.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "ts5";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "src/registry/ui");
const outFile = path.join(root, "src/registry/__generated__/api.json");

const clean = (s) => s.replace(/\s+/g, " ").trim();
const jsdoc = (node) =>
  clean(
    (ts.getJSDocCommentsAndTags(node) || [])
      .filter(ts.isJSDoc)
      .map((d) => (typeof d.comment === "string" ? d.comment : ts.getTextOfJSDocComment(d.comment) || ""))
      .join(" ")
  );

const HTML_HINT = {
  HTMLAttributes: "element",
  ButtonHTMLAttributes: "<button>",
  InputHTMLAttributes: "<input>",
  TextareaHTMLAttributes: "<textarea>",
  AnchorHTMLAttributes: "<a>",
  LabelHTMLAttributes: "<label>",
  ImgHTMLAttributes: "<img>",
  TableHTMLAttributes: "<table>",
  TdHTMLAttributes: "<td>",
  ThHTMLAttributes: "<th>",
};

function describeExtends(text) {
  const m = /React\.(\w+HTMLAttributes|HTMLAttributes)<(\w+)>/.exec(text);
  if (!m) return null;
  const el = HTML_HINT[m[1]] === "element" ? `<${m[2].replace(/^HTML|Element$/g, "").toLowerCase() || "div"}>` : HTML_HINT[m[1]];
  const omitted = [...text.matchAll(/"([\w-]+)"/g)].map((x) => x[1]);
  return { element: el.replace("<div>", "<div>").replace("<d>", "<div>"), omitted };
}

const api = {};
for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx")).sort()) {
  const file = name.replace(/\.tsx$/, "");
  const src = fs.readFileSync(path.join(dir, name), "utf8");
  const sf = ts.createSourceFile(name, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const interfaces = new Map();
  const aliases = new Map();
  const components = new Map(); // name -> { doc, defaults }

  const defaultsFromBinding = (pattern, into) => {
    for (const el of pattern.elements) {
      if (!ts.isBindingElement(el)) continue;
      const key = (el.propertyName || el.name).getText();
      if (el.initializer) into[key] = clean(el.initializer.getText());
    }
  };
  const readFn = (fn, compName, docNode) => {
    const defaults = {};
    const p = fn.parameters[0];
    if (p && ts.isObjectBindingPattern(p.name)) defaultsFromBinding(p.name, defaults);
    else if (p && ts.isIdentifier(p.name) && fn.body) {
      const pname = p.name.text;
      const visit = (n) => {
        if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer?.getText() === pname) defaultsFromBinding(n.name, defaults);
        ts.forEachChild(n, visit);
      };
      visit(fn.body);
    }
    const t = p?.type && ts.isTypeReferenceNode(p.type) ? p.type.typeName.getText() : null;
    components.set(compName, { doc: jsdoc(docNode), defaults, propsType: t });
  };

  for (const st of sf.statements) {
    const exported = st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isInterfaceDeclaration(st)) interfaces.set(st.name.text, st);
    if (ts.isTypeAliasDeclaration(st)) aliases.set(st.name.text, st);
    if (!exported) continue;
    if (ts.isFunctionDeclaration(st) && st.name) readFn(st, st.name.text, st);
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        let init = d.initializer;
        if (!init || !ts.isIdentifier(d.name)) continue;
        if (ts.isCallExpression(init) && /forwardRef|memo/.test(init.expression.getText())) init = init.arguments[0];
        if (init && (ts.isFunctionExpression(init) || ts.isArrowFunction(init))) readFn(init, d.name.text, st);
        else if (init && ts.isCallExpression(init) && init.expression.getText() === "Object.assign") {
          const f = init.arguments[0];
          if (f && (ts.isArrowFunction(f) || ts.isFunctionExpression(f))) components.set(d.name.text, { doc: jsdoc(st), defaults: {} });
        }
      }
    }
  }

  // Shows a local alias of string literals (e.g. ButtonVariant) as its values.
  const expand = (type) =>
    type.replace(/\b([A-Z]\w+)\b/g, (m) => {
      const a = aliases.get(m);
      return a && ts.isUnionTypeNode(a.type) && a.type.types.every((t) => ts.isLiteralTypeNode(t)) ? a.type.getText() : m;
    });
  const wrapFn = (t) => (t.includes("=>") && !/^\(.*\)$/.test(t) ? `(${t})` : t);

  // Collects members of an interface, following `extends` within the file.
  const collect = (decl, seen = new Set()) => {
    if (seen.has(decl.name.text)) return { props: [], inherits: [] };
    seen.add(decl.name.text);
    let props = [];
    let baseProps = [];
    const inherits = [];
    for (const h of decl.heritageClauses || [])
      for (const t of h.types) {
        const base = t.expression.getText();
        if (interfaces.has(base)) {
          const r = collect(interfaces.get(base), seen);
          baseProps = baseProps.concat(r.props);
          inherits.push(...r.inherits);
        } else {
          const ex = describeExtends(t.getText());
          if (ex) inherits.push(ex);
        }
      }
    for (const m of decl.members) {
      if (!ts.isPropertySignature(m) && !ts.isMethodSignature(m)) continue;
      const pname = m.name.getText().replace(/^"|"$/g, "");
      const type = ts.isMethodSignature(m)
        ? clean(`(${m.parameters.map((p) => p.getText()).join(", ")}) => ${m.type?.getText() || "void"}`)
        : clean(m.type?.getText() || "unknown");
      const def = ts.getJSDocTags(m).find((t) => t.tagName.text === "default");
      props.push({
        name: pname,
        type: expand(type),
        required: !m.questionToken,
        description: jsdoc(m),
        docDefault: def ? clean(typeof def.comment === "string" ? def.comment : ts.getTextOfJSDocComment(def.comment) || "") : null,
      });
    }
    return { props: props.concat(baseProps.filter((b) => !props.some((p) => p.name === b.name))), inherits };
  };

  // Merges the variants of a union props type (e.g. single | range) into one table.
  const resolve = (typeName) => {
    if (interfaces.has(typeName)) return collect(interfaces.get(typeName));
    const alias = aliases.get(typeName);
    if (!alias || !ts.isUnionTypeNode(alias.type)) return null;
    const merged = new Map();
    const inherits = [];
    const variants = alias.type.types.map((t) => t.getText()).filter((n) => interfaces.has(n));
    variants.forEach((v, vi) => {
      const r = collect(interfaces.get(v));
      inherits.push(...r.inherits);
      for (const p of r.props) {
        const cur = merged.get(p.name);
        if (!cur) merged.set(p.name, { ...p, variants: [p.type], seen: 1 });
        else {
          if (cur.type !== p.type && !cur.variants.includes(p.type)) {
            cur.variants.push(p.type);
            cur.type = cur.variants.map(wrapFn).join(" | ");
          }
          cur.description ||= p.description;
          cur.required &&= p.required;
          cur.seen++;
        }
      }
    });
    const props = [...merged.values()].map(({ seen, variants: _v, ...p }) => ({ ...p, required: p.required && seen === variants.length }));
    return { props, inherits };
  };

  const entries = {};
  for (const [comp, info] of components) {
    const r = resolve(`${comp}Props`) || (info.propsType ? resolve(info.propsType) : null);
    if (!r && !info.doc) continue;
    const props = (r?.props || []).map(({ docDefault, ...p }) => ({ ...p, default: info.defaults[p.name] ?? docDefault ?? null }));
    const inherits = (r?.inherits || []).filter((x, i, a) => a.findIndex((y) => y.element === x.element) === i);
    entries[comp] = { description: info.doc, props, inherits, client: /^["']use client["']/.test(src) };
  }
  api[file] = { client: /^["']use client["']/.test(src), components: entries };
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(api, null, 2) + "\n");
const n = Object.values(api).reduce((a, f) => a + Object.keys(f.components).length, 0);
console.log(`build-api: documented ${n} exports from ${Object.keys(api).length} files`);
