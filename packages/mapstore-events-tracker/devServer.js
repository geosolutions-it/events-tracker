const path = require('path');
const fs = require('fs-extra');
const envConfig = fs.existsSync(path.join(__dirname, '.env'))
    ? require('dotenv').config().parsed
    : {};
const dataDirectoryPath = process.env.DATA_DIRECTORY_PATH || envConfig.DATA_DIRECTORY_PATH || '.';
const devGeoServerTarget = process.env.DEV_GEOSERVER_TARGET || envConfig.DEV_GEOSERVER_TARGET || 'http://localhost:8080';
module.exports = (devServerDefault) => {
    return {
        ...devServerDefault,
        ...(dataDirectoryPath !== '.' && {
            contentBase: [path.resolve(__dirname, dataDirectoryPath), path.join(__dirname, '.')]
        }),
        proxy: {
            ...devServerDefault.proxy,
            '/geoserver': {
                // logLevel: 'debug',
                target: devGeoServerTarget
            }
        }
    };
};
