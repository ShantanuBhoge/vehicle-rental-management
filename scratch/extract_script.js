const fs = require('fs');
const html = fs.readFileSync('./frontend/index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.error("No script tag found!");
    process.exit(1);
}
const jsCode = scriptMatch[1];
fs.writeFileSync('./scratch/extracted.js', jsCode);
console.log("Script extracted successfully, size:", jsCode.length);

