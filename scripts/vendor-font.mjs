import { mkdir, writeFile } from "node:fs/promises";
const response = await fetch(
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&display=swap",
  {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    },
  },
);
if (!response.ok) throw new Error("Font stylesheet unavailable");
const css = await response.text();
const latin = css.split("/* latin */")[1] ?? css;
const url = latin?.match(/url\(([^)]+)\)/)?.[1];
if (!url) throw new Error("Latin variable font URL not found");
const font = await fetch(url);
if (!font.ok) throw new Error("Font unavailable");
const license = await fetch(
  "https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt",
);
if (!license.ok) throw new Error("Font license unavailable");
await mkdir("public/fonts", { recursive: true });
await writeFile(
  "public/fonts/dm-sans-latin.woff2",
  new Uint8Array(await font.arrayBuffer()),
);
await writeFile("public/fonts/OFL.txt", await license.text());
console.log("Saved licensed DM Sans variable Latin subset.");
