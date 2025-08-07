import { type ConfigEnv, defineConfig } from "vite";
import commonjsExternals from "vite-plugin-commonjs-externals";

const externals: (string | RegExp)[] = [/^node:.+$/, "@electron/remote", "path"];

// https://vitejs.dev/config
export default defineConfig((env: ConfigEnv) => ({
    define: {
        "process.env.NODE_ENV": JSON.stringify(env.mode),
    },
    build: {
        minify: false,
        assetsInlineLimit: 0,
        manifest: true,
        sourcemap: true,
    },
    esbuild: {
        minifyIdentifiers: false,
        minifySyntax: false,
        minifyWhitespace: false,
    },
    plugins: [
        commonjsExternals({
            externals,
        }),
    ],
}));

