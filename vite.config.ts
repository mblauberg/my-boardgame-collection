import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { configDefaults, defineConfig } from "vitest/config";
import handleBggRefresh from "./api/bgg-refresh";
import handleBggSearch from "./api/bgg-search";

const reactEntry = fileURLToPath(new URL("./node_modules/react/index.js", import.meta.url));
const reactJsxRuntimeEntry = fileURLToPath(
  new URL("./node_modules/react/jsx-runtime.js", import.meta.url),
);
const reactJsxDevRuntimeEntry = fileURLToPath(
  new URL("./node_modules/react/jsx-dev-runtime.js", import.meta.url),
);
const reactDomEntry = fileURLToPath(new URL("./node_modules/react-dom/index.js", import.meta.url));
const reactDomClientEntry = fileURLToPath(
  new URL("./node_modules/react-dom/client.js", import.meta.url),
);

async function readRequestBody(request: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
}

function devApiPlugin(): Plugin {
  return {
    name: "local-api-routes",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url;

        if (!url?.startsWith("/api/bgg-search") && !url?.startsWith("/api/bgg-refresh")) {
          return next();
        }

        try {
          const origin = `http://${req.headers.host ?? "127.0.0.1:5173"}`;
          const body = await readRequestBody(req);
          const headerEntries: [string, string][] = Object.entries(req.headers).flatMap(
            ([key, value]) =>
              Array.isArray(value)
                ? value.map((entry) => [key, entry] as [string, string])
                : value
                  ? [[key, value]]
                  : [],
          );
          const request = new Request(new URL(url, origin), {
            method: req.method,
            headers: new Headers(headerEntries),
            body,
          });

          const response =
            url.startsWith("/api/bgg-search")
              ? await handleBggSearch(request)
              : await handleBggRefresh(request);

          res.statusCode = response.status;

          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });

          const responseBody = Buffer.from(await response.arrayBuffer());
          res.end(responseBody);
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  for (const [key, value] of Object.entries(env)) {
    if ((key.startsWith("VITE_") || key === "BGG_APPLICATION_TOKEN") && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    plugins: [react(), devApiPlugin()],
    resolve: {
      alias: [
        { find: /^react\/jsx-dev-runtime$/, replacement: reactJsxDevRuntimeEntry },
        { find: /^react\/jsx-runtime$/, replacement: reactJsxRuntimeEntry },
        { find: /^react-dom\/client$/, replacement: reactDomClientEntry },
        { find: /^react-dom$/, replacement: reactDomEntry },
        { find: /^react$/, replacement: reactEntry },
      ],
      dedupe: ["react", "react-dom"],
    },
    server: {
      watch: {
        ignored: ["**/.worktrees/**"],
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: true,
      exclude: [...configDefaults.exclude, "**/.worktrees/**"],
      environmentOptions: {
        jsdom: {
          url: "http://localhost:3000",
        },
      },
    },
  };
});
