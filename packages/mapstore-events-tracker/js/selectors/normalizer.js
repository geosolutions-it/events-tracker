import { getHashQueryParameters } from '@js/utils/LocationUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';

export const getNormalizationValue = (state) => {
    const location = state?.router?.location;
    const viewerConfig = getConfigProp('viewerConfig');
    const normalizerOptions = viewerConfig?.normalizerOptions || [];
    const query = getHashQueryParameters(location);
    const { labelId = 'msEventsTracker.prompts.normalByNone', params } = normalizerOptions.find(({ value }) => value === query.normalizer) || {};
    return query.normalizer
        ? { value: query.normalizer, labelId, params }
        : { value: 'none', labelId };
};

export const getNormalizationDenominators = () => {
    const viewerConfig = getConfigProp('viewerConfig');
    return [
        {labelId: 'msEventsTracker.prompts.normalByNone', value: 'none'},
        ...viewerConfig?.normalizerOptions || []
    ];
};

export const getNumberParams = (state) => {
    const normalizer = getNormalizationValue(state);
    return normalizer?.params?.numberParams || {};
};
