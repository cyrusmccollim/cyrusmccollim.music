const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../../files/audio');
const scriptFile = path.join(__dirname, '../../script.js');

try {
    if (!fs.existsSync(audioDir) || !fs.existsSync(scriptFile)) {
        process.exit(1);
    }

    const catalog = {};
    const pages = fs.readdirSync(audioDir).filter(f => fs.statSync(path.join(audioDir, f)).isDirectory());

    pages.forEach(page => {
        catalog[page] = {};
        const categoriesDir = path.join(audioDir, page);
        const categories = fs.readdirSync(categoriesDir).filter(f => fs.statSync(path.join(categoriesDir, f)).isDirectory());

        categories.forEach(category => {
            const files = fs.readdirSync(path.join(categoriesDir, category))
                .filter(f => {
                    const ext = path.extname(f).toLowerCase();
                    return ext === '.mp3' || ext === '.wav' || ext === '.ogg' || ext === '.flac';
                })
                .map(f => `${page}/${category}/${f}`);

            if (files.length > 0) {
                const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
                catalog[page][formattedCategory] = files;
            }
        });

        if (Object.keys(catalog[page]).length === 0) {
            delete catalog[page];
        }
    });

    let scriptContent = fs.readFileSync(scriptFile, 'utf8');

    // Find where audioData is assigned in script.js
    const markerStart = 'const audioData = ';
    const startIndex = scriptContent.indexOf(markerStart);
    if (startIndex === -1) process.exit(1);

    const startObjIndex = scriptContent.indexOf('{', startIndex);
    let braceCount = 0;
    let endIndex = -1;

    if (startObjIndex !== -1) {
        for (let i = startObjIndex; i < scriptContent.length; i++) {
            if (scriptContent[i] === '{') braceCount++;
            else if (scriptContent[i] === '}') braceCount--;

            if (braceCount === 0) {
                // Find trailing semicolon
                const semiIndex = scriptContent.indexOf(';', i);
                endIndex = (semiIndex !== -1 && semiIndex - i < 10) ? semiIndex : i;
                break;
            }
        }
    }

    if (endIndex === -1) process.exit(1);

    const newAudioData = `const audioData = ${JSON.stringify(catalog, null, 6)};`;
    const finalScript = scriptContent.substring(0, startIndex) + newAudioData + scriptContent.substring(endIndex + 1);

    fs.writeFileSync(scriptFile, finalScript, 'utf8');
} catch (error) {
    process.exit(1);
}
