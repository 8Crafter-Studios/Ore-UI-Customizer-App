import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import json5 from "json5";

mkdirSync("./resources/assets/oreui/@ore-ui-types", { recursive: true });
writeFileSync(
    "./resources/assets/oreui/@ore-ui-types/enums",
    `// Copied from @ore-ui-types/enums v${
        (
            json5.parse(
                readFileSync("./node_modules/@ore-ui-types/enums/package.json", "utf8")
            ) as typeof import("./node_modules/@ore-ui-types/enums/package.json")
        ).version
    }
${readFileSync("./node_modules/@ore-ui-types/enums/index.js")}`
);
writeFileSync(
    "./resources/assets/oreui/@ore-ui-types/enums.map",
    readFileSync("./node_modules/@ore-ui-types/enums/index.js.map")
);
