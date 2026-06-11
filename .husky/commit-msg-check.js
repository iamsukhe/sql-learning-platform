/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error("Error: No commit message file path provided.");
  process.exit(1);
}

const commitMsgPath = path.resolve(commitMsgFile);
let commitMsg = "";

try {
  commitMsg = fs.readFileSync(commitMsgPath, "utf8").trim();
} catch (err) {
  console.error("Error: Could not read commit message file.", err);
  process.exit(1);
}

if (commitMsg.startsWith("Merge branch") || commitMsg.startsWith("Revert ")) {
  process.exit(0);
}

const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9\-]+\))?: .+/;

if (!pattern.test(commitMsg)) {
  console.error("\x1b[31m❌ Invalid Commit Message Format!\x1b[0m");
  console.error("\x1b[33mYour message: \"" + commitMsg + "\"\x1b[0m");
  console.error("\nFormat must follow Conventional Commits specification:");
  console.error("  <type>(<scope>): <subject>");
  console.error("\nAllowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert");
  process.exit(1);
}

console.log("\x1b[32m✅ Commit message format is valid.\x1b[0m");
process.exit(0);
