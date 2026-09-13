// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- This is the only spot where this import is allowed.
import * as globalifiedRendererImports_import from "./globalify_renderer_imports.ts";

globalThis.globalifiedRendererImports = globalifiedRendererImports_import;

declare global {
    export import globalifiedRendererImports = globalifiedRendererImports_import;
}
