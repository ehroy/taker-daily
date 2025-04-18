import fs from "fs";
import chalk from "chalk";
export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export async function getRandomFromTxt(fileName = "list.txt") {
  try {
    const data = await fs.readFileSync(fileName, "utf-8");
    const list = data
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (list.length === 0) throw new Error("List kosong.");

    const randomItem = list[Math.floor(Math.random() * list.length)];
    return randomItem;
  } catch (err) {
    console.error("Gagal membaca file:", err.message);
    return null;
  }
}
export function log(msg, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
  };
  switch (type) {
    case "success":
      console.log(`[${timestamp}] ➤ ✅  ${chalk.green(msg)}`);
      break;
    case "custom":
      console.log(`[${timestamp}] ➤ ℹ️  ${chalk.magenta(msg)}`);
      break;
    case "error":
      console.log(`[${timestamp}] ➤ ❌  ${chalk.red(msg)}`);
      break;
    case "warning":
      console.log(`[${timestamp}] ➤ ⚠️  ${chalk.yellow(msg)}`);
      break;
    default:
      console.log(`[${timestamp}] ➤  ${msg}`);
  }
}
