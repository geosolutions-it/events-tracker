# MapStore Events Tracker


## Documentation

- [Setup a new data directory for your dataset](docs/data-directory.md)
- [Viewer configuration (viewerConfig.json)](docs/viewer-config.md)

## Development

- `npm install`

- `npm start`

- app runs at http://localhost:8081/

npm install is needed only once at first setup or if the dependencies have been updated

NOTE: this application is mapping all the request direct to /geoserver to the http://localhost:8888 url.
It is possible to change the `devServer.js` to proxy a different instance of GeoServer or change the configuration in the localConfig.json to use an absolute path for GeoServer

## Test, debug and lint

The available test scripts are `npm run test` and `npm run test:watch`

- `npm run test:watch` watch changes on the files and rerun the tests
- `npm run test` run all tests and generate a report at http://localhost:8081/coverage/report-html/index.html

It possible to activate the debug mode and use the redux dev tool by adding the debug=true parameter to the dev url http://localhost:8081?debug=true/

The lint error should be highlighted in VS CODE IDE where the ESLint plugin is installed.
It is possible to run the script `npm run lint` to check all the lint errors for other developing environments.

## Build the app

- `./build.sh`

the compiled app will be copied to `dist/` folder in the current data directory target

## Tools

- node v14.17.0
- npm 6.14.13
