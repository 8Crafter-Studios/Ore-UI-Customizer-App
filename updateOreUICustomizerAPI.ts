import { writeFileSync } from "node:fs";

const oreUICustomizerAPIURL = "https://raw.githubusercontent.com/8Crafter-Studios/8Crafter.github.io/refs/heads/main/api/ore-ui-customizer-api.ts" as const;
const oreUICustomizerAssetsURL =
    "https://raw.githubusercontent.com/8Crafter-Studios/8Crafter.github.io/refs/heads/main/assets/shared/ore-ui-customizer-assets.ts" as const;

let oreUICustomizerAPIContents: string = await fetch(oreUICustomizerAPIURL).then((response: Response): Promise<string> => response.text());
let oreUICustomizerAssetsContents: string = await fetch(oreUICustomizerAssetsURL).then((response: Response): Promise<string> => response.text());

oreUICustomizerAPIContents = oreUICustomizerAPIContents.replace(
    `} from "../assets/shared/ore-ui-customizer-assets.js";`,
    `} from "./ore-ui-customizer-assets.js";`
);

oreUICustomizerAssetsContents = oreUICustomizerAssetsContents.replace(`import semver from "./semver.js";`, `import semver from "semver";`);

oreUICustomizerAPIContents = "/* eslint-disable */\n" + oreUICustomizerAPIContents;
oreUICustomizerAssetsContents = "/* eslint-disable */\n" + oreUICustomizerAssetsContents;

writeFileSync("./src/utils/ore-ui-customizer-api.ts", oreUICustomizerAPIContents, { encoding: "utf-8" });
writeFileSync("./src/utils/ore-ui-customizer-assets.ts", oreUICustomizerAssetsContents, { encoding: "utf-8" });

export {};
