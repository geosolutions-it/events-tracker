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
