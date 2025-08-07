declare module "electron-progressbar" {
    import { app, BrowserWindowConstructorOptions } from "electron";

    class ProgressBar {
        public constructor(options: ProgressBarOptions, electronApp?: typeof app);

        public getOptions(): ProgressBarOptions;

        public on(eventName: "ready" | "progress" | "completed" | "aborted", listener: () => void): this;
        public on(eventName: "progress" | "completed" | "aborted", listener: (value: number) => void): this;

        public setCompleted(): void;

        public close(): void;

        public isInProgress(): boolean;

        public isCompleted(): boolean;

        public value: number;
        public text: string;
        public detail: string;
        public get title(): undefined;
        public set title(title: string);
        public _options: ProgressBarOptions;
    }

    interface ProgressBarOptions {
        abortOnError?: boolean | null | undefined;
        indeterminate?: boolean | null | undefined;
        initialValue?: number | null | undefined;
        maxValue?: number | null | undefined;
        closeOnComplete?: boolean | null | undefined;
        title?: string | null | undefined;
        text?: string | null | undefined;
        detail?: string | null | undefined;
        style?: StyleOptions | null | undefined;
        browserWindow?: BrowserWindowConstructorOptions | null | undefined;
        remoteWindow?: typeof BrowserWindow | null | undefined;
        debug?: boolean | null | undefined;
        lang?: string | null | undefined;
        customHTML?: string | null | undefined;
    }

    interface StyleOptions {
        text?: Partial<CSSStyleDeclaration> | null | undefined;
        detail?: Partial<CSSStyleDeclaration> | null | undefined;
        bar?: Partial<CSSStyleDeclaration> | null | undefined;
        value?: Partial<CSSStyleDeclaration> | null | undefined;
    }

    export = ProgressBar;
}
