import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig, ForgeMakeResult, ResolvedForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";

if (existsSync(path.join(__dirname, ".env"))) loadEnvFile(path.join(__dirname, ".env"));

const osxSigningEnabled = !!(process.env.APPLE_TEAM_ID && process.env.APPLE_ID && process.env.APPLE_ID_APP_SPECIFIC_PASSWORD);

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        extendInfo: "./Info.plist",
        name: "8Crafter's Ore UI Customizer",
        executableName: "ore-ui-customizer-app",
        protocols: [
            {
                name: "8Crafter's Ore UI Customizer",
                schemes: ["ore-ui-customizer"],
            },
        ],
        icon: "./resources/icon",
        overwrite: true,
        extraResource: ["./resources"],
        osxSign:
            osxSigningEnabled ?
                {
                    identity: "Developer ID Application: Alexander Zahn (3FUJBBPY76)",
                }
            :   undefined,
        osxNotarize: /* osxSigningEnabled ?
                {
                    appleId: process.env.APPLE_ID!,
                    appleIdPassword: process.env.APPLE_ID_APP_SPECIFIC_PASSWORD!,
                    teamId: process.env.APPLE_TEAM_ID!,
                }
            :   */ undefined,
        appBundleId: "com.8crafter.ore-ui-customizer-app",
        appCategoryType: "public.app-category.developer-tools",
        appCopyright: "Copyright © 2025-2026 8Crafter Studios",
    },
    rebuildConfig: { extraModules: ["@electron/remote"] },
    makers: [
        new MakerSquirrel((arch: string) => ({
            setupIcon: "resources/icon.ico",
            setupExe: `Ore.UI.Customizer.App-win32-${arch}-${(require("./package.json") as typeof import("./package.json")).version} Setup.exe`,
            // setupMsi: `ore-ui-customizer-app_${arch}_${(require("./package.json") as typeof import("./package.json")).version} Setup.msi`,
            iconUrl: "https://raw.githubusercontent.com/8Crafter-Studios/Ore-UI-Customizer-App/refs/heads/main/resources/icon.ico",
        })),
        new MakerZIP({}),
        new MakerRpm(
            {
                options: {
                    icon: "resources/icon.png",
                    mimeType: ["x-scheme-handler/ore-ui-customizer"],
                    categories: ["Development", "Utility"],
                },
            },
            ["linux"]
        ),
        new MakerDeb({
            options: {
                icon: "resources/icon.png",
                mimeType: ["x-scheme-handler/ore-ui-customizer"],
                categories: ["Development", "Utility"],
                section: "editors",
            },
        }),
        new MakerDMG({
            // background // TODO: Make a background image for the DMG window.
            icon: "resources/icon.icns",
            name: "Ore UI Customizer",
        }),
    ],
    publishers: [
        {
            name: "@electron-forge/publisher-github",
            config: {
                repository: {
                    owner: "8Crafter-Studios",
                    name: "Ore-UI-Customizer-App",
                },
                prerelease: true,
                generateReleaseNotes: true,
                draft: true,
            },
        },
    ],
    plugins: [
        new VitePlugin({
            // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
            // If you are familiar with Vite configuration, it will look really familiar.
            build: [
                {
                    // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
                    entry: "src/main.ts",
                    config: "vite.main.config.ts",
                    target: "main",
                },
                {
                    entry: "src/preload.ts",
                    config: "vite.preload.config.ts",
                    target: "preload",
                },
            ],
            renderer: [
                {
                    name: "main_window",
                    config: "vite.renderer.config.ts",
                },
            ],
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
    hooks: {
        async postPackage(_config, packageResult) {
            packageResult.outputPaths.forEach((build_path: string): void => {
                if (existsSync(path.join(build_path, "resources/resources/ore-ui-viewer/src/assets/cubemap"))) {
                    console.log(
                        "[Ore UI Viewer pruner]: Deleting cubemap folder:",
                        path.join(build_path, "resources/resources/ore-ui-viewer/src/assets/cubemap")
                    );
                    rmSync(path.join(build_path, "resources/resources/ore-ui-viewer/src/assets/cubemap"), { recursive: true, force: true });
                } else {
                    console.warn(
                        "[Ore UI Viewer pruner]: No cubemap folder found at:",
                        path.join(build_path, "resources/resources/ore-ui-viewer/src/assets/cubemap")
                    );
                }
            });
        },
        async packageAfterPrune(_config: ResolvedForgeConfig, build_path: string): Promise<void> {
            const vite_config = await import("./vite.main.config.ts");
            const external: Exclude<NonNullable<NonNullable<ReturnType<typeof vite_config.default>["build"]>["rollupOptions"]>["external"], undefined> | [] =
                vite_config?.default({ command: "build", mode: "production" } as any)?.build?.rollupOptions?.external || [];
            const commands: string[] = [
                "install",
                "--no-package-lock",
                "--no-save",
                ...(typeof external === "string" ? [external]
                : external instanceof Array ? external.filter((external: string | RegExp): external is string => typeof external === "string")
                : []),
            ];

            return new Promise((resolve: (value: void) => void, reject: (reason?: any) => void): void => {
                const npm: ChildProcess = spawn("npm", commands, {
                    cwd: build_path,
                    stdio: "inherit",
                    shell: true,
                });

                npm.on("close", (code: number | null): void => {
                    if (0 === code) {
                        resolve();
                        return;
                    }

                    reject(`Process exited with code: ${code}`);
                });

                npm.on("error", reject);
            });
        } /* 
        postMake: async (forgeConfig: ResolvedForgeConfig, results: ForgeMakeResult[]): Promise<void> => {
            const version = require("./package.json").version;

            for (const result of results) {
                if (result.arch && result.platform === "win32") {
                    const arch = result.arch;
                    const outputPath = result.artifacts;
                    console.log(`Arch: ${arch}`, `Output Path: ${outputPath}`);
                      for (const file of result.artifacts) {
                        if (file.includes('Setup') || file.includes('full.nupkg')) {
                          const oldPath = path.join(outputPath, file);
                          const ext = path.extname(file);
                          const base = path.basename(file, ext);
                          const newName = `${base}-${arch}-${version}${ext}`;
                          const newPath = path.join(outputPath, newName);
                          fs.renameSync(oldPath, newPath);
                          console.log(`Renamed ${file} → ${newName}`);
                        }
                }
            }
        }, */,
        postMake: async (_forgeConfig: ResolvedForgeConfig, results: ForgeMakeResult[]) => {
            if (process.platform !== "darwin") return;

            renameDMG: {
                const targetPath: string = path.join(__dirname, "./out/make/Ore UI Customizer.dmg");
                if (!existsSync(targetPath)) break renameDMG;
                const targetResult: ForgeMakeResult | undefined = results.find((v: ForgeMakeResult): boolean => v.artifacts.includes(targetPath));
                if (!targetResult) throw new ReferenceError(`Failed to get arch for "${targetPath}" when attempting to rename DMG.`);
                const newPath: string = path.join(
                    targetPath,
                    `../Ore.UI.Customizer.App-darwin-${targetResult.arch}-${(targetResult.packageJSON as typeof import("./package.json")).version}.dmg`
                );
                targetResult.artifacts.splice(targetResult.artifacts.indexOf(targetPath), 1, newPath);
                renameSync(targetPath, newPath);
            }

            if (!osxSigningEnabled) return;
            const { spawn } = require("child_process") as typeof import("child_process");

            await new Promise((resolve: (value: void) => void, reject) => {
                const p = spawn("./scripts/notarize.sh", [], { stdio: "inherit" });
                p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`notarize failed: ${code}`))));
            });
        },
    },
};

export default config;

