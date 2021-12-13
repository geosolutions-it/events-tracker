#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());
const rimraf = require('rimraf');
const { updateVersion } = require('../scripts/utils');

const command = process.argv[2];

const gitignoreBody = `
node_modules/
dist/
`;

const buildShBody = `
set -e

echo "Running NPM install to update dependencies"
echo \`date\`
npm install

echo "Building frontend"
echo \`date\`
npm run compile
`;

if (command === 'create') {
    const destination = process.argv[3];
    if (destination) {
        const packageJSON = require(path.resolve(__dirname, '..', 'package.json'));
        const destinationPath = path.resolve(appDirectory, destination);
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath);
        }
        const dataPath = path.join(destinationPath, 'data');
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath);
        }
        const copyDataFiles = [
            'assets',
            'configs',
            'translations'
        ];
        copyDataFiles.forEach((name) => {
            fs.copySync(path.resolve(__dirname, '..', name), path.resolve(dataPath, name));
        });
        const copyFiles = [
            'LICENSE.txt'
        ];
        copyFiles.forEach((name) => {
            fs.copySync(path.resolve(__dirname, '..', name), path.resolve(destinationPath, name));
        });
        fs.writeFileSync(path.resolve(destinationPath, 'package.json'), JSON.stringify({
            "name": "mapstore-events-tracker-data",
            "version": "1.0.0",
            "scripts": {
                "compile": "mapstore-events-tracker compile"
            },
            "dependencies": {
                "mapstore-events-tracker": packageJSON.version
            },
            "author": "GeoSolutions",
            "license": "BSD-2-Clause"
        }, null, 2));
        fs.writeFileSync(path.resolve(destinationPath, '.gitignore'), gitignoreBody);
        fs.writeFileSync(path.resolve(destinationPath, 'build.sh'), buildShBody);
    } else {
        console.log(''); // eslint-disable-line no-console
        console.log('  Missing directory destination use:'); // eslint-disable-line no-console
        console.log(''); // eslint-disable-line no-console
        console.log('  npx mapstore-events-tracker create <directory destination>'); // eslint-disable-line no-console
        console.log(''); // eslint-disable-line no-console
        console.log('  or inside the repository use:'); // eslint-disable-line no-console
        console.log(''); // eslint-disable-line no-console
        console.log('  npm run create-data-dir <directory destination>'); // eslint-disable-line no-console
        console.log(''); // eslint-disable-line no-console
    }
} else if (command === 'compile') {
    const dataDirectory = path.resolve(appDirectory, 'data');
    if (fs.existsSync(dataDirectory)) {
        const distFolder = path.join(__dirname, '..', 'dist');
        const appDistFolder = path.join(appDirectory, 'dist');
        rimraf.sync(appDistFolder);
        fs.copySync(distFolder, appDistFolder);
        fs.copySync(dataDirectory, appDistFolder);
        updateVersion(appDistFolder);
    }
} else {
    console.log('command not available: ' + command); // eslint-disable-line no-console
}
