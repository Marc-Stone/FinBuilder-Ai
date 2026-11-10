import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import AutoImport from "unplugin-auto-import/vite";
// import { readdyJsxRuntimeProxyPlugin } from "./vite.jsx-runtime-proxy";

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
//const proxyPlugins = isPreview ? [readdyJsxRuntimeProxyPlugin()] : [];

/**
 * PWA : après le build, injecte dans out/sw.js
 *  - un identifiant de version (hash des fichiers générés) → purge des anciens caches à chaque déploiement ;
 *  - la liste des fichiers du chargement initial (entrée JS + imports statiques + CSS) à précacher.
 * Les pages chargées à la demande (lazy) sont mises en cache à la première visite.
 */
function pwaServiceWorker(): Plugin {
  let precache: string[] = [];
  let buildId = "dev";
  let outDir = "out";

  return {
    name: "finbuilder-pwa",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    generateBundle(_options, bundle) {
      const files = new Set<string>();
      const visit = (fileName: string) => {
        const chunk = bundle[fileName];
        if (!chunk || chunk.type !== "chunk" || files.has(fileName)) return;
        files.add(fileName);
        const meta = (chunk as { viteMetadata?: { importedCss?: Set<string> } }).viteMetadata;
        meta?.importedCss?.forEach((css) => files.add(css));
        chunk.imports.forEach(visit);
      };
      Object.values(bundle).forEach((item) => {
        if (item.type === "chunk" && item.isEntry) visit(item.fileName);
      });
      precache = Array.from(files).filter((file) => !file.endsWith(".map")).sort();

      const hash = createHash("sha256");
      Object.keys(bundle).sort().forEach((name) => hash.update(name));
      buildId = hash.digest("hex").slice(0, 12);
    },
    closeBundle() {
      const swPath = resolve(outDir, "sw.js");
      if (!existsSync(swPath)) return;
      const source = readFileSync(swPath, "utf8")
        .replace("__FB_BUILD_ID__", buildId)
        .replace("/* __FB_PRECACHE__ */ []", JSON.stringify(precache));
      writeFileSync(swPath, source);
    },
  };
}
// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
    __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
    __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
    __READDY_AI_DOMAIN__: JSON.stringify(process.env.READDY_AI_DOMAIN || ""),
  },
  plugins: [
    // ...proxyPlugins,
    react(),
    pwaServiceWorker(),
    AutoImport({
      imports: [
        {
          react: [
            ["default", "React"],
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
        // React i18n
        {
          "react-i18next": ["useTranslation", "Trans"],
        },
      ],
      dts: true,
    }),
  ],
  base,
  build: {
    sourcemap: "hidden",
    outDir: 'out',
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
