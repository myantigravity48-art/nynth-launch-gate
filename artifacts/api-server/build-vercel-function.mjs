import { builtinModules } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceDir = path.resolve(packageDir, "../..");
const entryPoint = path.join(workspaceDir, "artifacts/admin/src/api-handler.ts");
const outputFile = path.join(workspaceDir, "artifacts/admin/api/[...path].js");
const outputDir = path.dirname(outputFile);
const optionalRuntimeModules = {
  name: "vercel-optional-runtime-modules",
  setup(build) {
    build.onResolve(
      { filter: /^(supports-color|@react-email\/render)$/ },
      ({ path: specifier }) => ({
        path: specifier === "supports-color" ? "supports-color" : "react-email-render",
        namespace: "vercel-optional-runtime-modules",
      }),
    );
    build.onLoad(
      { filter: /.*/, namespace: "vercel-optional-runtime-modules" },
      ({ path: moduleName }) => ({
        contents:
          moduleName === "supports-color"
            ? "module.exports = false;"
            : 'throw new Error("React email templates are not enabled in this function.");',
        loader: "js",
      }),
    );
  },
};

async function bundleVercelFunction() {
  await mkdir(outputDir, { recursive: true });
  await rm(outputFile, { force: true });

  const result = await build({
    absWorkingDir: workspaceDir,
    entryPoints: [entryPoint],
    outfile: outputFile,
    bundle: true,
    packages: "bundle",
    platform: "node",
    format: "esm",
    target: "node20",
    define: { "process.env.NODE_ENV": '"production"' },
    metafile: true,
    logLevel: "info",
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);`,
    },
    plugins: [optionalRuntimeModules],
  });

  const outputKey = path.relative(workspaceDir, outputFile).split(path.sep).join("/");
  const output = result.metafile.outputs[outputKey];
  if (!output) {
    throw new Error(`esbuild did not report the expected output: ${outputKey}`);
  }

  const builtinSet = new Set(
    builtinModules.flatMap((specifier) => [specifier, `node:${specifier}`]),
  );
  const nonBuiltinImports = output.imports
    .filter(({ path: specifier }) => !builtinSet.has(specifier))
    .map(({ path: specifier }) => specifier);

  if (nonBuiltinImports.length > 0) {
    throw new Error(
      `Vercel function bundle still has external package imports: ${nonBuiltinImports.join(", ")}`,
    );
  }

  console.log(
    `Bundled Vercel function to ${path.relative(workspaceDir, outputFile)}; ` +
      `remaining imports are Node.js built-ins only.`,
  );
}

bundleVercelFunction().catch((error) => {
  console.error(error);
  process.exit(1);
});
