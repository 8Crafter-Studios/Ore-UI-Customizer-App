import * as globalifiedRendererImports_import from "./globalify_renderer_imports.ts";

globalThis.globalifiedRendererImports = globalifiedRendererImports_import;

declare global {
    export import globalifiedRendererImports = globalifiedRendererImports_import;
}
