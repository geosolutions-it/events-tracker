const path = require('path');
const fs = require('fs-extra');
const { updateVersion } = require('./utils');
const rimraf = require('rimraf');
const envConfig = fs.existsSync(path.join(__dirname, '..', '.env'))
    ? require('dotenv').config().parsed
    : {};
const dataDirectoryPath = process.env.DATA_DIRECTORY_PATH || envConfig.DATA_DIRECTORY_PATH || '.';

const distFolder = path.join(__dirname, '..', 'dist');

// remove useless files from dist folder
rimraf.sync(path.join(distFolder, 'bootstrap'));
rimraf.sync(path.join(distFolder, 'themes', '*.js'));

if (dataDirectoryPath !== '.') {
    const dataDirectory = path.resolve(__dirname, '..', dataDirectoryPath);
    // move the dist at the same level of the data folder
    const appDistFolder = path.join(dataDirectory, '..', 'dist');
    rimraf.sync(appDistFolder);
    fs.copySync(dataDirectory, distFolder);
    fs.moveSync(distFolder, appDistFolder);
    updateVersion(appDistFolder);
}
