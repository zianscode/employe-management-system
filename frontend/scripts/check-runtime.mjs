import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = path.join(root, "src");
const blocked = /^(?:@\/server(?:\/|$)|@prisma\/|prisma(?:\/|$)|next-auth(?:\/|$)|@auth\/|pg(?:\/|$)|nodemailer(?:\/|$))/;
const forbiddenTrace = /(?:^|\/)node_modules\/(?:@prisma\/|prisma\/|next-auth\/|@auth\/|pg\/|nodemailer\/)/;
const checked = new Set();
const problems = [];

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

const config = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (config.error) throw new Error("Cannot read frontend tsconfig");
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const cache = ts.createModuleResolutionCache(root, (name) => name, options);

function checkModule(file) {
  if (checked.has(file)) return;
  checked.add(file);
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const report = (message) => problems.push(path.relative(root, file) + " " + message);
  function follow(node) {
    if (!node || !ts.isStringLiteralLike(node)) return;
    const name = node.text;
    if (blocked.test(name)) {
      report("imports " + name);
      return;
    }
    const module = ts.resolveModuleName(name, file, options, ts.sys, cache).resolvedModule;
    if (!module) return;
    const target = path.resolve(module.resolvedFileName);
    if (target.startsWith(path.join(src, "server") + path.sep)) {
      report("imports " + path.relative(root, target));
      return;
    }
    if (target.startsWith(src + path.sep) && /\.[cm]?[jt]sx?$/.test(target) && !/\.d\.ts$/.test(target)) checkModule(target);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) follow(node.moduleSpecifier);
    if (ts.isExportDeclaration(node) && !node.isTypeOnly) follow(node.moduleSpecifier);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(source) === "require")) {
      follow(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }
  for (const statement of source.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    if (statement.expression.text === "use server") report("contains a Server Action");
  }
  visit(source);
}

for (const file of [...files(path.join(src, "app")), path.join(src, "middleware.ts")]) {
  if (/\.[cm]?[jt]sx?$/.test(file) && !/\.(test|spec|d)\.[cm]?[jt]sx?$/.test(file)) checkModule(file);
}
console.log(checked.size + " runtime source files checked");

if (process.argv.includes("--build")) {
  const server = path.join(root, ".next", "server");
  const manifest = JSON.parse(fs.readFileSync(path.join(server, "server-reference-manifest.json"), "utf8"));
  const actions = Object.keys(manifest.node ?? {}).length + Object.keys(manifest.edge ?? {}).length;
  if (actions) problems.push(actions + " server references in the production build");
  const traces = files(server).filter((file) => file.endsWith(".nft.json"));
  if (!traces.length) problems.push("No Next.js runtime file traces found");
  for (const file of traces) {
    const entries = JSON.parse(fs.readFileSync(file, "utf8")).files;
    const legacy = entries.find((entry) => forbiddenTrace.test(entry.replaceAll("\\", "/")));
    if (legacy) problems.push(path.relative(root, file) + " traces " + legacy);
  }
  console.log(traces.length + " production traces, " + actions + " Server Actions");
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
}
