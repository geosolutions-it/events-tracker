const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');

function updateVersion(distFolder) {
    const indexHTMLPath = path.join(distFolder, 'index.html');
    let version;
    try {
        version = childProcess
            .execSync('git rev-parse --short HEAD')
            .toString().trim();
    } catch (e) {
        version = 'dev';
    }
    const indexHTML = fs.readFileSync(indexHTMLPath, 'utf8');
    const updatedIndexHTML = indexHTML.replace(/\{mapstore-events-tracker-version\}/g, version);
    fs.writeFileSync(indexHTMLPath, updatedIndexHTML);
}

module.exports = {
    updateVersion
};
