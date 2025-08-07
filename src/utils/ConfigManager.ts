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
    type LegacyOreUICustomizerConfigJSON,
} from "./ore-ui-customizer-assets.ts";
import { format_version, resolveOreUICustomizerSettings } from "./ore-ui-customizer-api.ts";
import { Dirent, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import * as CommentJSON from "comment-json";
import { sanitizeFilename } from "./sanitize-filename.ts";
import { deepMerge } from "./deepMerge.ts";
import { createToast } from "../../app/components/Toast.tsx";

export interface ConfigManagerEventMap {
    configCreated: [newConfig: OreUICustomizerConfig];
    configEdited: [editedConfig: OreUICustomizerConfig];
    configRefreshed: [refreshedConfig: OreUICustomizerConfig];
    configImported: [importedConfig: OreUICustomizerConfig];
    configRemoved: [removedConfig: OreUICustomizerConfig];
    activeConfigsChanged: [activeConfigs: (OreUICustomizerConfig | ConfigInfo)[]];
}

export type PartialOreUICustomizerConfig_Type = {
    [key in keyof OreUICustomizerConfig_Type]: key extends "oreUICustomizerConfig" ? Partial<OreUICustomizerConfig_Type[key]> : OreUICustomizerConfig_Type[key];
};

export interface SavedOreUICustomizerConfig_Type extends PartialOreUICustomizerConfig_Type {
    readonly?: boolean;
    metadata: MergeObjectTypes<
        NonNullable<OreUICustomizerConfig_Type["metadata"]> & Required<Pick<NonNullable<OreUICustomizerConfig_Type["metadata"]>, "name" | "uuid" | "version">>
    >;
}

export interface OreUICustomizerConfigMessageInfo<T extends "info" | "warning" | "error" = "info" | "warning" | "error"> {
    config: OreUICustomizerConfig;
    messageFormat: "text" | "html";
    message: string;
    titleFormat?: "text" | "html";
    title?: string;
    type: T;
    cause?: unknown;
}

export interface ConfigInfo {
    name?: string;
    metadata?: Partial<OreUICustomizerConfig["metadata"]>;
    uuid: string;
    version: string;
}

export interface MissingConfigInfo extends ConfigInfo {
    missingType: "noMatchingUUID" | "noMatchingVersion";
}

export class OreUICustomizerConfig implements PartialOreUICustomizerConfig_Type {
    public manifest: SavedOreUICustomizerConfig_Type;
    /**
     * The path to the config file.
     */
    public readonly filePath: string;
    public get oreUICustomizerConfig(): Partial<OreUICustomizerSettings> {
        return this.manifest.oreUICustomizerConfig;
    }
    public set oreUICustomizerConfig(value: Partial<OreUICustomizerSettings>) {
        this.manifest.oreUICustomizerConfig = value;
    }
    public get oreUICustomizerVersion(): string {
        return this.manifest.oreUICustomizerVersion;
    }
    public set oreUICustomizerVersion(value: string) {
        this.manifest.oreUICustomizerVersion = value;
    }
    public get checkForUpdatesDetails(): PartialOreUICustomizerConfig_Type["checkForUpdatesDetails"] {
        return this.manifest.checkForUpdatesDetails;
    }
    public set checkForUpdatesDetails(value: PartialOreUICustomizerConfig_Type["checkForUpdatesDetails"]) {
        if (value === undefined) delete this.manifest.checkForUpdatesDetails;
        this.manifest.checkForUpdatesDetails = value;
    }
    public get marketplaceDetails(): PartialOreUICustomizerConfig_Type["marketplaceDetails"] {
        return this.manifest.marketplaceDetails;
    }
    public set marketplaceDetails(value: PartialOreUICustomizerConfig_Type["marketplaceDetails"]) {
        if (value === undefined) delete this.manifest.marketplaceDetails;
        this.manifest.marketplaceDetails = value;
    }
    public get metadata(): SavedOreUICustomizerConfig_Type["metadata"] {
        return this.manifest.metadata;
    }
    public set metadata(value: SavedOreUICustomizerConfig_Type["metadata"]) {
        this.manifest.metadata = value;
    }
    public get readonly(): boolean {
        return this.manifest.readonly ?? false;
    }
    public set readonly(value: boolean | undefined) {
        if (value === undefined) delete this.manifest.readonly;
        this.manifest.readonly = value;
    }
    /**
     * The data URI of the icon of the config.
     */
    public icon?: `data:image/${string};base64,${string}` | undefined;
    public constructor(filePath: string) {
        this.filePath = path.resolve(filePath);
        const manifest: SavedOreUICustomizerConfig_Type | PartialOreUICustomizerConfig_Type = CommentJSON.parse(
            readFileSync(filePath, { encoding: "utf-8" }),
            null,
            true
        ) as any;
        let saveAfterLoading: boolean = false;
        if (
            typeof manifest.metadata !== "object" ||
            manifest.metadata === null ||
            manifest.metadata.product_type !== "config" ||
            typeof manifest.metadata.version !== "string" ||
            manifest.metadata.name !== "1.0.0"
        ) {
            saveAfterLoading = true;
        }
        // console.log(manifest);
        manifest.metadata = {
            name: `Unnamed Config`,
            uuid: crypto.randomUUID(),
            version: "1.0.0",
            ...manifest.metadata,
            product_type: "config",
        };
        (manifest as SavedOreUICustomizerConfig_Type).readonly = "readonly" in manifest ? manifest.readonly ?? false : false;
        this.manifest = manifest as SavedOreUICustomizerConfig_Type;
        this.icon = this.manifest.metadata.pack_icon_data_uri ?? undefined;
        if (saveAfterLoading) this.saveChanges();
    }
    public saveChanges(): void {
        writeFileSync(this.filePath, JSON.stringify(this.toSavedConfigData(), null, 4), { encoding: "utf-8" });
        ConfigManager.emit("configEdited", this);
    }
    /**
     * Checks if an update is available for the config.
     *
     * @returns Whether an update is available for the config.
     *
     * @todo
     */
    public getIsUpdateAvailable(): boolean {
        return false;
    }
    /**
     * Gets the messages for the config.
     *
     * This includes info, warning, and error messages.
     *
     * @param types An array of the types of messages to get. Defaults to all messages.
     * @returns The messages for the config.
     *
     * @todo
     */
    public getMessages<
        T extends ("info" | "warning" | "error")[] | "all" = "all",
        T2 extends "info" | "warning" | "error" = T extends "all" ? "info" | "warning" | "error" : T[number]
    >(types: T = "all" as T): OreUICustomizerConfigMessageInfo<T2>[] {
        const messages: OreUICustomizerConfigMessageInfo[] = [];
        if (types === "all") return messages as OreUICustomizerConfigMessageInfo<T2>[];
        return messages.filter((message: OreUICustomizerConfigMessageInfo): message is OreUICustomizerConfigMessageInfo<T2> =>
            types.includes(message.type as T2)
        );
    }
    public getResolvedOreUICustomizerSettings(): OreUICustomizerSettings {
        return resolveOreUICustomizerSettings(this.oreUICustomizerConfig);
    }
    public toSavedConfigData(): SavedOreUICustomizerConfig_Type {
        return {
            oreUICustomizerConfig: this.oreUICustomizerConfig,
            oreUICustomizerVersion: this.oreUICustomizerVersion,
            checkForUpdatesDetails: this.checkForUpdatesDetails,
            marketplaceDetails: this.marketplaceDetails,
            metadata: this.metadata,
            readonly: this.readonly,
        };
    }
    public toJSON(): ConfigInfo {
        return {
            uuid: this.metadata.uuid,
            version: this.metadata.version,
            metadata: this.metadata,
            name: this.metadata.name,
        };
    }
    public refresh(): void {
        this.manifest = CommentJSON.parse(readFileSync(this.filePath, { encoding: "utf-8" }), null, true) as any;
        this.icon = this.manifest.metadata.pack_icon_data_uri ?? undefined;
        ConfigManager.emit("configRefreshed", this);
    }
    public delete(): void {
        if (existsSync(this.filePath)) {
            rmSync(this.filePath, { recursive: true, force: true });
            if (ConfigManager.loadedConfigs.includes(this)) {
                ConfigManager.loadedConfigs.splice(ConfigManager.loadedConfigs.indexOf(this), 1);
            }
            ConfigManager.emit("configRemoved", this);
        }
    }
}

export const ConfigManager = new (class ConfigManager extends EventEmitter<ConfigManagerEventMap> {
    public readonly configsFolder: string = path.join(APP_DATA_FOLDER_PATH, CONFIG_FOLDER_PATH);
    public readonly activeConfigsJSONPath: string = path.join(APP_DATA_FOLDER_PATH, "active_configs.json");
    public loadedConfigs: OreUICustomizerConfig[] = [];
    public get currentConfig(): OreUICustomizerConfig_Type {
        const activeConfigs: OreUICustomizerConfig[] = this.getActiveConfigs().filter(
            (v: OreUICustomizerConfig | ConfigInfo): v is OreUICustomizerConfig => v instanceof OreUICustomizerConfig
        );
        return activeConfigs.length === 0
            ? {
                  oreUICustomizerConfig: defaultOreUICustomizerSettings,
                  oreUICustomizerVersion: format_version,
              }
            : {
                  oreUICustomizerConfig: deepMerge(
                      {},
                      defaultOreUICustomizerSettings,
                      ...activeConfigs.map((v: OreUICustomizerConfig): Partial<OreUICustomizerSettings> => v.oreUICustomizerConfig)
                  ),
                  oreUICustomizerVersion: format_version,
              };
    }
    public constructor() {
        super();
        this.setMaxListeners(1000000);
    }
    public getConfigFromFilePath(filePath: string): OreUICustomizerConfig | undefined {
        filePath = path.resolve(filePath);
        if (!existsSync(filePath)) return undefined;
        let config: OreUICustomizerConfig | undefined = this.loadedConfigs.find((config: OreUICustomizerConfig): boolean => config.filePath === filePath);
        if (!config) {
            config = new OreUICustomizerConfig(filePath);
            this.loadedConfigs.push(config);
        }
        return config;
    }
    public getConfigFromUUID(uuid: string): OreUICustomizerConfig | undefined {
        return this.loadedConfigs.find((config: OreUICustomizerConfig): boolean => config.metadata.uuid === uuid);
    }
    public getConfigFromUUIDAndVersion(uuid: string, version: string): OreUICustomizerConfig | undefined {
        return this.loadedConfigs.find((config: OreUICustomizerConfig): boolean => config.metadata.uuid === uuid && config.metadata.version === version);
    }
    public getUnnamedConfigNumber(): number {
        let undefinedCount: number = 0;
        const directoryHighestNumber: number = readdirSync(this.configsFolder, { withFileTypes: true, recursive: false, encoding: "utf-8" })
            .filter((file: Dirent<string>): boolean => file.isFile())
            .reduce((previousValue: number, file: Dirent<string>): number => {
                if (file.name.match(/^Unnamed Config (\d+)-/i)?.[1]) {
                    return Math.max(previousValue, Number(file.name.match(/^Unnamed Config (\d+)-/i)?.[1]) + 1);
                }
                return previousValue;
            }, 1);
        const loadedConfigsHighestNumber: number = this.loadedConfigs.reduce(
            (previousValue: number, config: OreUICustomizerConfig): number =>
                config.metadata?.name === undefined || config.metadata.name === "Unnamed Config"
                    ? (undefinedCount++, previousValue)
                    : config.metadata.name.match(/^Unnamed Config (\d+)$/)?.[1]
                    ? Number(config.metadata.name.match(/^Unnamed Config (\d+)$/)?.[1]) + 1
                    : previousValue,
            1
        );
        return Math.max(directoryHighestNumber, loadedConfigsHighestNumber);
    }
    public selectConfig(): OreUICustomizerConfig {
        // TO-DO
        return undefined!;
    }
    public getActiveConfigs<E extends boolean = false>(
        excludeMissing?: E
    ): E extends true ? OreUICustomizerConfig[] : (OreUICustomizerConfig | MissingConfigInfo)[] {
        if (!existsSync(this.activeConfigsJSONPath)) {
            writeFileSync(this.activeConfigsJSONPath, JSON.stringify([], null, 4), { encoding: "utf-8" });
        }
        const activeConfigs: ConfigInfo[] = CommentJSON.parse(readFileSync(this.activeConfigsJSONPath, { encoding: "utf-8" }), null, true) as any;
        return activeConfigs
            .map(
                (config: ConfigInfo): E extends true ? OreUICustomizerConfig | undefined : OreUICustomizerConfig | MissingConfigInfo =>
                    (this.loadedConfigs.find(
                        (loadedConfig: OreUICustomizerConfig): boolean =>
                            loadedConfig.metadata.uuid === config.uuid && loadedConfig.metadata.version === config.version
                    ) ??
                        (excludeMissing
                            ? undefined
                            : this.loadedConfigs.some((loadedConfig: OreUICustomizerConfig): boolean => loadedConfig.metadata.uuid === config.uuid)
                            ? { ...config, missingType: "noMatchingVersion" }
                            : { ...config, missingType: "noMatchingUUID" })) as E extends true
                        ? OreUICustomizerConfig | undefined
                        : OreUICustomizerConfig | MissingConfigInfo
            )
            .filter(
                (
                    config: E extends true ? OreUICustomizerConfig | undefined : OreUICustomizerConfig | MissingConfigInfo
                ): config is E extends true ? OreUICustomizerConfig : OreUICustomizerConfig => !!config
            );
    }
    public setActiveConfigs(activeConfigs: (OreUICustomizerConfig | ConfigInfo)[]): void {
        const parsedActiveConfigs: (OreUICustomizerConfig | ConfigInfo)[] = activeConfigs.map(
            (v: OreUICustomizerConfig | ConfigInfo): OreUICustomizerConfig | ConfigInfo =>
                v instanceof OreUICustomizerConfig
                    ? v
                    : (Object.fromEntries(Object.entries(v).filter(([key]: [key: string, value: any]): boolean => key !== "missingType")) as ConfigInfo)
        );
        writeFileSync(this.activeConfigsJSONPath, JSON.stringify(parsedActiveConfigs, null, 4), { encoding: "utf-8" });
        this.emit("activeConfigsChanged", this.getActiveConfigs());
    }
    public getInactiveConfigs(): OreUICustomizerConfig[] {
        const activeConfigs: (OreUICustomizerConfig | ConfigInfo)[] = this.getActiveConfigs();
        return this.loadedConfigs.filter((v: OreUICustomizerConfig): boolean => !activeConfigs.includes(v));
    }
    /**
     * @todo Make this not import from both preload and renderer.
     */
    public loadConfigs(): Error[] {
        const errors: Error[] = [];
        for (const config of readdirSync(this.configsFolder, { withFileTypes: true, recursive: false, encoding: "utf-8" })) {
            if (config.isFile()) {
                if (!config.name.toLowerCase().endsWith(".json")) continue;
                const filePath: string = path.join(APP_DATA_FOLDER_PATH, CONFIG_FOLDER_PATH, config.name);
                if (this.loadedConfigs.some((loadedConfig: OreUICustomizerConfig): boolean => loadedConfig.filePath === filePath)) {
                    this.loadedConfigs.splice(
                        this.loadedConfigs.findIndex((loadedConfig: OreUICustomizerConfig): boolean => loadedConfig.filePath === filePath),
                        1
                    );
                }
                try {
                    this.loadedConfigs.push(new OreUICustomizerConfig(filePath));
                } catch (e: any) {
                    if (e instanceof Error) {
                        errors.push(e);
                    } else {
                        errors.push(new Error(`Error: ${e}`, { cause: e }));
                    }
                }
            }
        }
        return errors;
    }
    public parseConfigData(
        configData: OreUICustomizerConfig_Type | SavedOreUICustomizerConfig_Type | PartialOreUICustomizerConfig_Type | LegacyOreUICustomizerConfigJSON
    ): PartialOreUICustomizerConfig_Type {
        if ("format_version" in configData) {
            const outputData = {
                oreUICustomizerConfig: { ...configData } as Partial<LegacyOreUICustomizerConfigJSON>,
                oreUICustomizerVersion: configData.format_version,
            };
            delete outputData.oreUICustomizerConfig.format_version;
            return outputData;
        }
        return configData;
    }
    public async importFromDataURI(dataURI: string): Promise<OreUICustomizerConfig> {
        if (!dataURI.startsWith("data:")) throw new ReferenceError(`Invalid data URI: ${dataURI}`);
        const dataURIMIMEType: string | undefined = dataURI.split(/[,;]/g)[0]?.split(":")[1]?.toLowerCase();
        switch (dataURIMIMEType) {
            case "application/json":
            case "text/json":
            case "text/plain": {
                const request = new XMLHttpRequest();
                request.open("GET", dataURI, false);
                request.setRequestHeader("Content-Type", dataURIMIMEType);
                request.send();
                let configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(request.responseText, null, true) as any;
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            case "application/octet-stream":
            case "application/ouicconfig": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                try {
                    await zipFs.importData64URI(dataURI);
                } catch {
                    const request = new XMLHttpRequest();
                    request.open("GET", dataURI, false);
                    request.setRequestHeader("Content-Type", "application/json");
                    request.send();
                    let configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(request.responseText, null, true) as any;
                    if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                    configData = this.parseConfigData(configData);
                    configData.metadata ||= {
                        product_type: "config",
                    };
                    if (
                        configData.metadata.uuid &&
                        configData.metadata.version &&
                        this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                    ) {
                        createToast({
                            image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                            title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                            message: "Duplicate pack detected",
                        });
                        throw new ReferenceError("Duplicate pack detected.");
                    }
                    configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                    configData.metadata.version ||= "1.0.0";
                    configData.metadata.uuid ||= crypto.randomUUID();
                    const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                    writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                    const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                    this.loadedConfigs.push(config);
                    this.emit("configImported", config);
                    return config;
                }
                let configData: PartialOreUICustomizerConfig_Type | undefined;
                if (zipFs.getChildByName("config.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("config.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else if (zipFs.getChildByName("manifest.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else {
                    const JSONFiles: (zip.ZipFileEntry<any, any> & { name: `${string}.json` })[] = zipFs.root.children.filter(
                        (v: zip.ZipEntry): v is zip.ZipFileEntry<any, any> & { name: `${string}.json` } =>
                            v instanceof zip.ZipFileEntry && /\.json(?:c)?$/.test(v.name)
                    );
                    if (JSONFiles.length === 1) {
                        configData = CommentJSON.parse(await JSONFiles[0]!.getText(), null, true) as any;
                    } else {
                        for (const JSONFile of JSONFiles) {
                            try {
                                configData = CommentJSON.parse(await JSONFile.getText(), null, true) as any;
                                break;
                            } catch {}
                        }
                    }
                }
                if (!configData) throw new ReferenceError("No config found in zip file, or config is invalid.");
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                // await addFolderContentsReversed(zipFs.root, path.join(this.configsFolder, folderName));
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            case "application/zip": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                await zipFs.importData64URI(dataURI);
                let configData: PartialOreUICustomizerConfig_Type | undefined;
                if (zipFs.getChildByName("config.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("config.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else if (zipFs.getChildByName("manifest.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else {
                    const JSONFiles: (zip.ZipFileEntry<any, any> & { name: `${string}.json` })[] = zipFs.root.children.filter(
                        (v: zip.ZipEntry): v is zip.ZipFileEntry<any, any> & { name: `${string}.json` } =>
                            v instanceof zip.ZipFileEntry && /\.json(?:c)?$/.test(v.name)
                    );
                    if (JSONFiles.length === 1) {
                        configData = CommentJSON.parse(await JSONFiles[0]!.getText(), null, true) as any;
                    } else {
                        for (const JSONFile of JSONFiles) {
                            try {
                                configData = CommentJSON.parse(await JSONFile.getText(), null, true) as any;
                                break;
                            } catch {}
                        }
                    }
                }
                if (!configData) throw new ReferenceError("No config found in zip file, or config is invalid.");
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                // await addFolderContentsReversed(zipFs.root, path.join(this.configsFolder, folderName));
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            default:
                throw new ReferenceError(
                    `Invalid MIME type: ${dataURIMIMEType}. Must be "application/javascript", "text/javascript", "application/octet-stream", "application/zip", or "application/ouicconfig".`
                );
        }
    }
    public async importFromURL(url: string): Promise<OreUICustomizerConfig> {
        const response = await fetch(url);
        const responseMIMEType: string | undefined = response.headers.get("content-type")?.split(";")[0]?.toLowerCase();
        switch (responseMIMEType) {
            case "application/json":
            case "text/json":
            case "text/plain": {
                let configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(await response.text(), null, true) as any;
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            case "application/octet-stream":
            case "application/ouicconfig": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                const blob: Blob = await response.blob();
                try {
                    await zipFs.importBlob(blob);
                } catch {
                    const responseText: string = await blob.text();
                    let configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(responseText, null, true) as any;
                    if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                    configData = this.parseConfigData(configData);
                    configData.metadata ||= {
                        product_type: "config",
                    };
                    if (
                        configData.metadata.uuid &&
                        configData.metadata.version &&
                        this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                    ) {
                        createToast({
                            image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                            title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                            message: "Duplicate pack detected",
                        });
                        throw new ReferenceError("Duplicate pack detected.");
                    }
                    configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                    configData.metadata.version ||= "1.0.0";
                    configData.metadata.uuid ||= crypto.randomUUID();
                    const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                    writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                    const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                    this.loadedConfigs.push(config);
                    this.emit("configImported", config);
                    return config;
                }
                let configData: PartialOreUICustomizerConfig_Type | undefined;
                if (zipFs.getChildByName("config.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("config.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else if (zipFs.getChildByName("manifest.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else {
                    const JSONFiles: (zip.ZipFileEntry<any, any> & { name: `${string}.json` })[] = zipFs.root.children.filter(
                        (v: zip.ZipEntry): v is zip.ZipFileEntry<any, any> & { name: `${string}.json` } =>
                            v instanceof zip.ZipFileEntry && /\.json(?:c)?$/.test(v.name)
                    );
                    if (JSONFiles.length === 1) {
                        configData = CommentJSON.parse(await JSONFiles[0]!.getText(), null, true) as any;
                    } else {
                        for (const JSONFile of JSONFiles) {
                            try {
                                configData = CommentJSON.parse(await JSONFile.getText(), null, true) as any;
                                break;
                            } catch {}
                        }
                    }
                }
                if (!configData) throw new ReferenceError("No config found in zip file, or config is invalid.");
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                // await addFolderContentsReversed(zipFs.root, path.join(this.configsFolder, folderName));
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            case "application/zip": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                await zipFs.importBlob(await response.blob());
                let configData: PartialOreUICustomizerConfig_Type | undefined;
                if (zipFs.getChildByName("config.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("config.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else if (zipFs.getChildByName("manifest.json")) {
                    configData = CommentJSON.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
                } else {
                    const JSONFiles: (zip.ZipFileEntry<any, any> & { name: `${string}.json` })[] = zipFs.root.children.filter(
                        (v: zip.ZipEntry): v is zip.ZipFileEntry<any, any> & { name: `${string}.json` } =>
                            v instanceof zip.ZipFileEntry && /\.json(?:c)?$/.test(v.name)
                    );
                    if (JSONFiles.length === 1) {
                        configData = CommentJSON.parse(await JSONFiles[0]!.getText(), null, true) as any;
                    } else {
                        for (const JSONFile of JSONFiles) {
                            try {
                                configData = CommentJSON.parse(await JSONFile.getText(), null, true) as any;
                                break;
                            } catch {}
                        }
                    }
                }
                if (!configData) throw new ReferenceError("No config found in zip file, or config is invalid.");
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                // await addFolderContentsReversed(zipFs.root, path.join(this.configsFolder, folderName));
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            default:
                throw new ReferenceError(
                    `Invalid MIME type: ${responseMIMEType}. Must be "application/javascript", "text/javascript", "application/octet-stream", "application/zip", or "application/ouicconfig".`
                );
        }
    }
    public async importFromFilePath(filePath: string): Promise<OreUICustomizerConfig> {
        if (/\.(?:mc)?ouicconfig$/i.test(path.basename(filePath).toLowerCase())) {
            /**
             * The zip file system.
             */
            const zipFs: zip.FS = new zip.fs.FS();
            const dataURI = `data:application/octet-stream;base64,${readFileSync(filePath, { encoding: "base64" })}`;
            try {
                await zipFs.importData64URI(dataURI);
            } catch {
                const responseText: string = readFileSync(filePath, { encoding: "utf-8" });
                let configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(responseText, null, true) as any;
                if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
                configData = this.parseConfigData(configData);
                configData.metadata ||= {
                    product_type: "config",
                };
                if (
                    configData.metadata.uuid &&
                    configData.metadata.version &&
                    this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
                ) {
                    createToast({
                        image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
                configData.metadata.version ||= "1.0.0";
                configData.metadata.uuid ||= crypto.randomUUID();
                const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
                writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
                const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
                this.loadedConfigs.push(config);
                this.emit("configImported", config);
                return config;
            }
            let configData: PartialOreUICustomizerConfig_Type | undefined;
            if (zipFs.getChildByName("config.json")) {
                configData = CommentJSON.parse(await (zipFs.getChildByName("config.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
            } else if (zipFs.getChildByName("manifest.json")) {
                configData = CommentJSON.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(), null, true) as any;
            } else {
                const JSONFiles: (zip.ZipFileEntry<any, any> & { name: `${string}.json` })[] = zipFs.root.children.filter(
                    (v: zip.ZipEntry): v is zip.ZipFileEntry<any, any> & { name: `${string}.json` } =>
                        v instanceof zip.ZipFileEntry && /\.json(?:c)?$/.test(v.name)
                );
                if (JSONFiles.length === 1) {
                    configData = CommentJSON.parse(await JSONFiles[0]!.getText(), null, true) as any;
                } else {
                    for (const JSONFile of JSONFiles) {
                        try {
                            configData = CommentJSON.parse(await JSONFile.getText(), null, true) as any;
                            break;
                        } catch {}
                    }
                }
            }
            if (!configData) throw new ReferenceError("No config found in zip file, or config is invalid.");
            if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
            configData = this.parseConfigData(configData);
            configData.metadata ||= {
                product_type: "config",
            };
            if (
                configData.metadata.uuid &&
                configData.metadata.version &&
                this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
            ) {
                createToast({
                    image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                    title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                    message: "Duplicate pack detected",
                });
                throw new ReferenceError("Duplicate pack detected.");
            }
            configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
            configData.metadata.version ||= "1.0.0";
            configData.metadata.uuid ||= crypto.randomUUID();
            const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
            // await addFolderContentsReversed(zipFs.root, path.join(this.configsFolder, folderName));
            writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
            const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
            this.loadedConfigs.push(config);
            this.emit("configImported", config);
            return config;
        } else if (/^\.json(?:c|ld?)?$/i.test(path.extname(filePath).toLowerCase())) {
            const responseText: string = readFileSync(filePath, { encoding: "utf-8" });
            let configData: PartialOreUICustomizerConfig_Type = CommentJSON.parse(responseText, null, true) as any;
            if (typeof configData !== "object" || configData === null) throw new ReferenceError("Invalid config file, must be a valid JSON object.");
            configData = this.parseConfigData(configData);
            configData.metadata ||= {
                product_type: "config",
            };
            if (
                configData.metadata.uuid &&
                configData.metadata.version &&
                this.getConfigFromUUIDAndVersion(configData.metadata.uuid, configData.metadata.version)
            ) {
                createToast({
                    image: configData.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                    title: `Failed to import '${configData.metadata.name ?? "Unnamed Config"}'`,
                    message: "Duplicate pack detected",
                });
                throw new ReferenceError("Duplicate pack detected.");
            }
            configData.metadata.name ||= `Unnamed Config ${this.getUnnamedConfigNumber()}`;
            configData.metadata.version ||= "1.0.0";
            configData.metadata.uuid ||= crypto.randomUUID();
            const fileName: string = sanitizeFilename(`${configData.metadata.name.slice(0, 25)}-${Date.now()}-${configData.metadata.version}.json`);
            writeFileSync(path.join(this.configsFolder, fileName), JSONB.stringify({ ...configData, readonly: true }, null, 4));
            const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(this.configsFolder, fileName));
            this.loadedConfigs.push(config);
            this.emit("configImported", config);
            return config;
        }
        throw new ReferenceError(`Invalid file type: ${path.extname(filePath)}. Must be ".ouicconfig", ".mcouicconfig", ".json", or ".jsonc".`);
    }
})();

ConfigManager.on("configImported", (importedConfig: OreUICustomizerConfig): void => {
    createToast({
        title: `Successfully imported '${importedConfig.metadata.name}'`,
        image: importedConfig.metadata.pack_icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
    });
});

const loadConfigsErrors: Error[] = ConfigManager.loadConfigs();
if (loadConfigsErrors.length > 0) console.error(loadConfigsErrors);
