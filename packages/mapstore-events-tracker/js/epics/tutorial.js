/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import get from 'lodash/get';
import { INIT_TUTORIAL, setupTutorial } from '@mapstore/framework/actions/tutorial';

export const setupDashboardTutorial = (action$, store) =>
    action$.ofType(INIT_TUTORIAL)
        .switchMap(() => {
            const tutorialPresetList = get(store.getState(), 'tutorial.presetList') || {};
            const tutorialKey = 'dashboard_tutorial_list';
            return tutorialPresetList[tutorialKey]
                ? Rx.Observable.of(
                    setupTutorial(tutorialKey, tutorialPresetList[tutorialKey])
                )
                : Rx.Observable.empty();
        });
