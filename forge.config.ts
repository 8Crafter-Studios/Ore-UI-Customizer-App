import type { ForgeConfig, ForgeMakeResult, ResolvedForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { type ChildProcess, spawn } from "node:child_process";

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
        icon: "./resources/icon.ico",
        overwrite: true,
        extraResource: ["./resources"],
    },
    rebuildConfig: { extraModules: ["@electron/remote"] },
    makers: [
        new MakerSquirrel({
            setupIcon: "resources/icon.ico",
            iconUrl: "https://raw.githubusercontent.com/8Crafter-Studios/Ore-UI-Customizer-App/refs/heads/main/resources/icon.ico",
        }),
        new MakerZIP({}, ["darwin"]),
        new MakerRpm({
            options: {
                icon: "resources/icon.png",
                mimeType: ["x-scheme-handler/ore-ui-customizer"],
            },
        }),
        new MakerDeb({
            options: {
                icon: "resources/icon.png",
                mimeType: ["x-scheme-handler/ore-ui-customizer"],
            },
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
        packageAfterPrune: async (config: ResolvedForgeConfig, build_path: string): Promise<void> => {
            const vite_config = await import("./vite.main.config.ts");
            const external: Exclude<NonNullable<NonNullable<ReturnType<typeof vite_config.default>["build"]>["rollupOptions"]>["external"], undefined> | [] =
                vite_config?.default({ command: "build", mode: "production" } as any)?.build?.rollupOptions?.external || [];
            const commands: string[] = [
                "install",
                "--no-package-lock",
                "--no-save",
                ...(typeof external === "string"
                    ? [external]
                    : external instanceof Array
                    ? external.filter((external: string | RegExp): external is string => typeof external === "string")
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
        },/* 
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
        }, */
    },
};

export default config;

