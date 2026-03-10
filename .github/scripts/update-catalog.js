const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '../../files/audio');
const htmlFile = path.join(__dirname, '../../index.html');

try {
    if (!fs.existsSync(audioDir) || !fs.existsSync(htmlFile)) {
        process.exit(1);
    }

    const catalog = {};
    const categories = fs.readdirSync(audioDir).filter(f => fs.statSync(path.join(audioDir, f)).isDirectory());

    categories.forEach(category => {
        const files = fs.readdirSync(path.join(audioDir, category))
            .filter(f => {
                const ext = path.extname(f).toLowerCase();
                return ext === '.mp3' || ext === '.wav' || ext === '.ogg' || ext === '.flac';
            })
            .map(f => `${category}/${f}`);

        if (files.length > 0) {
            const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
            catalog[formattedCategory] = files;
        }
    });

    let htmlContent = fs.readFileSync(htmlFile, 'utf8');

    // Find where audioData is assigned in index.html
    const markerStart = 'const audioData = ';
    const startIndex = htmlContent.indexOf(markerStart);
    if (startIndex === -1) process.exit(1);

    const startObjIndex = htmlContent.indexOf('{', startIndex);
    let braceCount = 0;
    let endIndex = -1;

    if (startObjIndex !== -1) {
        for (let i = startObjIndex; i < htmlContent.length; i++) {
            if (htmlContent[i] === '{') braceCount++;
            else if (htmlContent[i] === '}') braceCount--;

            if (braceCount === 0) {
                // Find trailing semicolon
                const semiIndex = htmlContent.indexOf(';', i);
                endIndex = (semiIndex !== -1 && semiIndex - i < 10) ? semiIndex : i;
                break;
            }
        }
    }

    if (endIndex === -1) process.exit(1);

    const newAudioData = `const audioData = ${JSON.stringify(catalog, null, 6)};`;
    const finalHtml = htmlContent.substring(0, startIndex) + newAudioData + htmlContent.substring(endIndex + 1);

    fs.writeFileSync(htmlFile, finalHtml, 'utf8');
} catch (error) {
    process.exit(1);
}
