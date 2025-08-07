// @ts-nocheck
/**
 * src/utils/ConfigManager.ts
 * @module
 * @description A file containing the ConfigManager class.
 * @supports Renderer
 */
import path from "node:path";
import { APP_DATA_FOLDER_PATH, CONFIG_FOLDER_PATH } from "./URLs.ts";
import EventEmitter from "node:events";
import {
    defaultOreUICustomizerSettings,
    type OreUICustomizerSettings,
    type OreUICustomizerConfig as OreUICustomizerConfig_Type,
} from "./ore-ui-customizer-assets.ts";
import { format_version, resolveOreUICustomizerSettings } from "./ore-ui-customizer-api.ts";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as CommentJSON from "comment-json";

interface ConfigManagerEventMap {
    configChange: [newConfig: OreUICustomizerConfig];
}

type PartialOreUICustomizerConfig_Type = {
    [key in keyof OreUICustomizerConfig_Type]: key extends "oreUICustomizerConfig" ? Partial<OreUICustomizerConfig_Type[key]> : OreUICustomizerConfig_Type[key];
};

type OreUICustomizerConfigSource = { type: "url" | "filePath" | "dataURI"; value: string } | { type: "raw"; value: string | PartialOreUICustomizerConfig_Type };

export class OreUICustomizerConfigB implements PartialOreUICustomizerConfig_Type {
    public readonly source: OreUICustomizerConfigSource;
    public oreUICustomizerConfig: Partial<OreUICustomizerSettings> = {};
    public oreUICustomizerVersion: string = "";
    private constructor(
        source: OreUICustomizerConfigSource,
        completionCallback: (config: OreUICustomizerConfig) => void = (): void => {},
        rejectionCallback: (error: any) => void = (): void => {}
    ) {
        this.source = source;
        switch (source.type) {
            case "url": {
                fetch(source.value)
                    .then(async (response: Response): Promise<OreUICustomizerConfig_Type> => CommentJSON.parse(await response.text(), null, true) as any)
                    .then((configData: OreUICustomizerConfig_Type): void => {
                        this.oreUICustomizerConfig = configData.oreUICustomizerConfig;
                        this.oreUICustomizerVersion = configData.oreUICustomizerVersion;
                        completionCallback(this);
                    })
                    .catch(rejectionCallback);
                break;
            }
            case "filePath": {
                if (!existsSync(source.value)) throw new ReferenceError(`File not found: ${source.value}`);
                const configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(readFileSync(source.value, { encoding: "utf-8" }), null, true) as any;
                this.oreUICustomizerConfig = configData.oreUICustomizerConfig;
                this.oreUICustomizerVersion = configData.oreUICustomizerVersion;
                break;
            }
            case "dataURI": {
                if (!source.value.startsWith("data:")) throw new ReferenceError(`Invalid data URI: ${source.value}`);
                const dataURIMIMEType: string | undefined = source.value.split(/[,;]/g)[0]?.split(":")[1];
                function assertIsValidMIMEType(mimeType: string | undefined): asserts mimeType is "application/json" | "application/octet-stream" | "application/zip" {
                    if (mimeType !== "application/json" && mimeType !== "application/octet-stream" && mimeType !== "application/zip") throw new ReferenceError(`Invalid MIME type: ${mimeType}. Must be "application/json", "application/octet-stream", or "application/zip".`);
                }
                assertIsValidMIMEType(dataURIMIMEType);
                const request = new XMLHttpRequest();
                request.open("GET", source.value, false);
                request.setRequestHeader("Content-Type", dataURIMIMEType);
                request.send();
                const configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(request.responseText, null, true) as any;
                this.oreUICustomizerConfig = configData.oreUICustomizerConfig;
                this.oreUICustomizerVersion = configData.oreUICustomizerVersion;
                break;
            }
            case "raw": {
                const configData: PartialOreUICustomizerConfig_Type =
                    typeof source.value === "string" ? (CommentJSON.parse(source.value, null, true) as any) : source.value;
                this.oreUICustomizerConfig = configData.oreUICustomizerConfig;
                this.oreUICustomizerVersion = configData.oreUICustomizerVersion;
                break;
            }
        }
    }
    public static async fromURL(url: string): Promise<OreUICustomizerConfig> {
        return new Promise(
            (resolve: (config: OreUICustomizerConfig) => void, reject: (error: any) => void): OreUICustomizerConfig =>
                new OreUICustomizerConfig({ type: "url", value: url }, resolve, reject)
        );
    }
    public static fromFilePath(filePath: string): OreUICustomizerConfig {
        return new OreUICustomizerConfig({ type: "filePath", value: filePath });
    }
    public static fromDataURI(dataURI: string): OreUICustomizerConfig {
        return new OreUICustomizerConfig({ type: "dataURI", value: dataURI });
    }
    public static fromRawConfig(config: string | PartialOreUICustomizerConfig_Type): OreUICustomizerConfig {
        return new OreUICustomizerConfig({ type: "raw", value: config });
    }
    public getResolvedOreUICustomizerSettings(): OreUICustomizerSettings {
        return resolveOreUICustomizerSettings(this.oreUICustomizerConfig);
    }
    public static defaultConfig: OreUICustomizerConfig = new OreUICustomizerConfig({
        type: "raw",
        value: { oreUICustomizerConfig: defaultOreUICustomizerSettings, oreUICustomizerVersion: format_version },
    });
}

export const ConfigManagerB = new (class ConfigManagerB extends EventEmitter<ConfigManagerEventMap> {
    #currentConfig: OreUICustomizerConfig = OreUICustomizerConfig.defaultConfig;
    public loadedConfigs: OreUICustomizerConfig[] = [];
    public get currentConfig(): OreUICustomizerConfig {
        return this.#currentConfig;
    }
    public set currentConfig(value: OreUICustomizerConfig) {
        if (!(value instanceof OreUICustomizerConfig)) throw new TypeError("Value must be an instance of the OreUICustomizerConfig class.");
        this.#currentConfig = value;
        this.emit("configChange", this.currentConfig);
    }
    public constructor() {
        super();
        this.setMaxListeners(1000000);
        this.loadConfigs();
    }
    public selectConfig(): OreUICustomizerConfig {
        // TO-DO
        return undefined!;
    }
    public loadConfigs(): void {
        for (const config of readdirSync(path.join(APP_DATA_FOLDER_PATH, CONFIG_FOLDER_PATH), { withFileTypes: true })) {
            if (config.isFile()) {
                if (!config.name.toLowerCase().endsWith(".json")) continue;
                const filePath: string = path.join(APP_DATA_FOLDER_PATH, CONFIG_FOLDER_PATH, config.name);
                if (
                    this.loadedConfigs.some(
                        (loadedConfig: OreUICustomizerConfig): boolean => loadedConfig.source.type === "filePath" && loadedConfig.source.value === filePath
                    )
                ) {
                    this.loadedConfigs.splice(
                        this.loadedConfigs.findIndex(
                            (loadedConfig: OreUICustomizerConfig): boolean => loadedConfig.source.type === "filePath" && loadedConfig.source.value === filePath
                        ),
                        1
                    );
                }
                try {
                    this.loadedConfigs.push(OreUICustomizerConfig.fromFilePath(filePath));
                } catch (e: any) {
                    console.error(e, e?.stack);
                }
            }
        }
        if (this.loadedConfigs.length === 0) {

        }
    }
})();
