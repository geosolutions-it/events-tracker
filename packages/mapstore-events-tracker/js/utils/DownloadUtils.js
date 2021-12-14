import Papa from 'papaparse';
import moment from 'moment';
import { getMessageById, getLocale } from '@mapstore/framework/utils/LocaleUtils';
import JsZip from 'jszip';
import { download } from 'mapstore/web/client/utils/FileUtils';
import Mustache from 'mustache';
import axios from '@mapstore/framework/libs/ajax';

let readmeCache = {};

function getReadme() {
    const locale = getLocale();
    return new Promise(resolve => {
        if (readmeCache[locale]) {
            resolve(readmeCache[locale]);
        } else {
            axios.get(`assets/templates/readme/${locale}.mustache`)
                .then(({ data }) => {
                    readmeCache[locale] = data;
                    resolve(data);
                })
                .catch(() => {
                    resolve();
                });
        }
    });
}

export const getZipFileName = (messages) => {
    const baseName = getMessageById(messages, "msEventsTracker.download.fileName");
    const date = new Date().toISOString().split("T")[0];
    return `${baseName}-${date}.zip`;
};

export const getTypes = (viewer, messages) => {
    const types = viewer.table.cols.map(({labelId}) => getMessageById(messages, labelId));
    types.shift();
    return types.join(", ");
};

export const addCsv = (name, rows, zip, columns) => {
    zip.file(name, Papa.unparse(rows, { columns }));
};

export const getFeatureName = (messages) => {
    return getMessageById(messages, "msEventsTracker.feature").toUpperCase();
};

export const getDataPointsName = (messages)  => {
    return getMessageById(messages, "msEventsTracker.dataPoints").toUpperCase();
};

export const getColumns = (columns, messages) => {
    return columns.map(({value}) => {
        if (value === getMessageById(messages, "msEventsTracker.featureKey")) {
            return getFeatureName(messages);
        } else if (value === "*") {
            return getDataPointsName(messages);
        }
        return value;
    });
};

export const formatdatesRange = (datesRange, dateFormat) => {
    const locale = getLocale();
    return {
        from: moment(datesRange.from + "", dateFormat || "YYYYMM").locale(locale).format("LL"),
        to: moment(datesRange.from + "", dateFormat || "YYYYMM").locale(locale).format("LL")
    };
};

export const getDataFileName = (messages) => {
    return getMessageById(messages, "msEventsTracker.dataPoints").toLowerCase();
};

export const getBaseLayerName = (messages) => {
    return getMessageById(messages, "msEventsTracker.feature").toLowerCase();
};

export const getColumnsFromChart = (messages) => {
    return [
        getMessageById(messages, "msEventsTracker.labels.countersTitle").toUpperCase(),
        getMessageById(messages, "msEventsTracker.labels.time").toUpperCase(),
        getDataPointsName(messages)
    ];
};

export const getRowsFromChart = (chartData, messages) => {
    const exportRows = [];
    chartData.forEach(data => {
        data.x.forEach((time, i) => {
            const exportRow = {};
            exportRow[getMessageById(messages, "msEventsTracker.labels.countersTitle").toUpperCase()] = data.category;
            exportRow[getMessageById(messages, "msEventsTracker.labels.time").toUpperCase()] = time;
            exportRow[getDataPointsName(messages)] = data.y[i];
            exportRows.push(exportRow);
        });
    });
    return exportRows;
};

export const getViewDescription = ({files, viewer, viewerConfig, normalizer, messages}) => {
    return {
        files,
        normalizerTxt: normalizer.labelId !== "msEventsTracker.prompts.normalByNone" ? getMessageById(messages, normalizer.labelId) : "",
        types: getTypes(viewer, messages),
        datesRange: formatdatesRange(viewer.datesRange, viewerConfig?.date?.format),
        url: document.location.href
    };
};

export const getRows = (table, messages) => {
    const exportRows = [];
    table.rows.forEach(row => {
        const exportRow = {};
        const feature = getFeatureName(messages);
        const featureKey = getMessageById(messages, "msEventsTracker.featureKey");
        Object.keys(row).forEach(key => {
            if (key === featureKey) {
                exportRow[feature] = row[key].value || row[key];
            } else if (key === "*") {
                exportRow[getDataPointsName(messages)] = row[key].value || row[key];
            } else {
                exportRow[key] = row[key].value || row[key];
            }
        });
        exportRows.push(exportRow);
    });
    return exportRows;
};

export const addReadMe = ({zip, template, files, viewer, viewerConfig, normalizer, messages}) => {
    const data = getViewDescription({files, viewer, viewerConfig, normalizer, messages});
    const html = Mustache.render(template, data);
    zip.file(files[0].name, html);
};

export const addGeoJson = (name, layer, zip) => {
    const exportLayer = {
        type: "FeatureCollection",
        crs: {type: "name", properties: {name: "urn:ogc:def:crs:EPSG::4326"}},
        features: []
    };
    layer.features.forEach(feature => {
        const exportProps = {};
        const currentProps = feature.properties;
        Object.keys(currentProps).filter(prop => !["geometry_name", "style"].includes(prop))
            .forEach(prop => {
                if (prop === "type") {
                    Object.keys(currentProps.type).forEach(p => {
                        exportProps[p] = currentProps.type[p];
                    });
                } else {
                    exportProps[prop] = currentProps[prop];
                }
            });
        exportLayer.features.push({...feature, properties: exportProps});
    });
    zip.file(name, JSON.stringify(exportLayer, null, 2));
};

export const downloadZip = ({files, checkedState, layers, viewer, normalizer, messages}) => {
    const zip = new JsZip();
    getReadme()
        .then((template) => {
            if (template && checkedState[0]) {
                addReadMe({zip, template, files, viewer, normalizer, messages});
            }
            if (checkedState[1]) {
                addGeoJson(files[1].name, {features: viewer.features}, zip.folder(files[1].folder));
            }
            if (checkedState[2]) {
                addGeoJson(files[2].name, layers[0], zip.folder(files[2].folder));
            }
            if (checkedState[3]) {
                addCsv(
                    files[3].name,
                    getRows(viewer.table, messages),
                    zip.folder(files[3].folder),
                    getColumns(viewer.table.cols, messages)
                );
            }
            if (checkedState[4]) {
                const chartData = viewer.chart.data;
                addCsv(
                    files[4].name,
                    getRowsFromChart(chartData, messages),
                    zip.folder(files[4].folder),
                    getColumnsFromChart(messages)
                );
            }
            zip.generateAsync({type: "blob"}).then(function(content) {
                download(content, getZipFileName(messages), "application/zip");
            });
        });
};
