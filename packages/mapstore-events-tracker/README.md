# MapStore Events Tracker

Table of content:

- [Create a new client folder](#create-a-new-client-folder)
- [Development](#development)
- [Test, debug and lint](#test-debug-and-lint)
- [Build the app](#build-the-app)
- [Viewer configuration](#viewer-configuration)
- [Tools](#tools)
## Create a new client folder

This section assumes that a new database with layers as been configured in PostGIS and GeoServer and a new client dashboard is needed.Following steps shows how to setup the new static folder:

Navigate to the client folder in the repository root

```bash
cd events-tracker/client
```

Run the create script from with npx

```bash
npx mapstore-events-tracker create ./my-project
```

This script creates a new folder with all the needed static configuration that can be overrides to fit the needs of a specific dataset. The data/configs folder contains all the json files needed to configure the client with the correct layers and endpoints in GeoServer 
## Development

Clone the repository

```bash
git clone https://github.com/geosolutions-it/events-tracker.git
```

Navigate in the client repository folder and install the node dependencies

```bash
cd events-tracker/packages/mapstore-events-tracker
```

Add a new .env file to mapstore-events-tracker folder

```bash
touch .env
```

Add these variable to the .env file

```
DATA_DIRECTORY_PATH=../../client/new-york/data
DEV_GEOSERVER_TARGET=http://localhost:8888
```

Note with DATA_DIRECTORY_PATH equal to `../../client/new-york/data` we will use configuration from the new-york folder, it is possible to target a different folder if needed.

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

## Viewer configuration

This application provide some static custom configuration provided via `configs/viewerConfig.json` that change the structure and map visualizations on the viewer.

### viewerConfig

| property | type | description |  |
| --- | --- | --- | --- |
| `title` | {string} | document title |  |
| `url` | {string} | base GeoServer url to make the WPS request |  |
| `featureTypeName` | {string} | name of the features datastore to target with the WPS requests |  |
| `defaultChartColor` | {string} | a default color to assign when using total values in chart and table |  |
| `categories` | {array} | list of accepted catagories |  |
| `category` | {array} | information of the attribute to use as category |  |
| category.`key` | {string} | attribute name to use as category |  |
| category.`type` | {string} | type of attribute (eg: string, number) |  |
| `date` | {array} | information of the attribute to use as date |  |
| date.`key` | {string} | attribute name to use as date |  |
| date.`type` | {string} | type of attribute (eg: string, number, date) |  |
| date.`format` | {string} | format of the date |  |
| `features` | {array} | information of the attribute to use as features |  |
| features.`key` | {string} | attribute name to use as features |  |
| features.`type` | {string} | type of attribute (eg: string, number, date) |  |
| `mapVisualizations` | {array} | list of map visualizations  |  |
| `normalizerOptions` | {array} | list of options available for count normalization  |  |

### Category object

```js
// example
{
    "labelId": "msEventsTracker.categories.robbery", // translation id defined in translation
    "value": "ROBBERY", // value of the category attribute (identifier)
    "color": "#ff33aa" // color to assign to this category
}
```
### Map visualization
```js
{
    "id": "precinct", // unique id of the visualization
    "labelId": "msEventsTracker.mapVisualizations.feature", // translation id to use on the select input
    "layers": [ // list of layer to display as overlay for this visualization
        {
            "type": "vector", // currently only type vector with classification custom property is supported for rendering client side
            "url": "/geoserver/wfs", // url location of the features collection
            "groupBy": { // this configuration allows to group duplicated features created to show the count of different categories
                "keys": ["pct"], // array of properties keys to use as unique identifier
                "categoryKey": "type", // the key of the property that represent the category (should match viewerConfig.category.key)
                "valueKey": "crime_count" // the key of the property that represent the count associated to the category
            },
            "params": { // additional params in case of wfs request
                "service": "WFS",
                "typeName": "crimes_precint",
                "version": "1.1.0",
                "request": "GetFeature",
                "outputFormat": "application/json"
            },
            "classification": { // classification custom object
                "labelId": "msEventsTracker.prompts.normalByPop", // translation id for the legend title
                "type": "scaleQuantile", // type of scale algorithm (using d3-scale)
                "domain": "per1000", // attribute to use as domain
                "domainExtent": false, // allow to use the extent of the domain to compute the classes
                "range": [ // range of value to map
                    "#fef6ee",
                    "#fedec2",
                    "#fec69d",
                    "#f2aa86",
                    "#d29a81"
                ],
                "stylePropertyKey": "fillColor" // style property used to apply the class
            },
            "style": { // default style of the vector layer
                "fillColor": "#33ffaa",
                "fillOpacity": 0.75,
                "color": "ffffff",
                "opacity": 0,
                "weight": 0
            },
            "viewParamsMap": { // map of the view params to the default query parameters
                "from": "min_mo",
                "to": "max_mo",
                "category": "crime_type"
            },
            "pointerMovePopup": { // field to display on the pointer move popup
                "fields": [
                    {
                        "key": "name"
                    },
                    {
                        "key": "crime_count",
                        "labelId": "count"
                    }
                ]
            },
            "popup": { // field to display on the popup
                "title": true, // the title is the value of the current feature (viewerConfig.feature.layer)
                "fields": [
                    {
                        "key": "crime_count",
                        "labelId": "count"
                    },
                    {
                        "key": "pop",
                        "labelId": "population",
                        "target": "feature"
                    }
                ]
            }
        }
    ]
}
```
### Normalize option

```js
{
    "labelId": "population", // translation id for the option label
    "value": "pop", // key of the property to use for the normalization
    "params": {
        "multiplier": 1000, // multiplier value
        "numberParams": { // options for the number format, for doc see Intl.NumberFormat() doc https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
            "maximumFractionDigits": 4,
            "minimumFractionDigits": 4
        }
    }
},
```

## Tools

- node v14.17.0
- npm 6.14.13
