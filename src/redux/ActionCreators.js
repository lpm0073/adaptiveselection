import * as ActionTypes from './ActionTypes';
import { categoriesUrl } from '../shared/urls';


export const addUserSignal = (signal, image) => {
    return {
        type: ActionTypes.ADD_USER_SIGNAL,
        signal: signal,
        payload: image
    }
}
export const addImageCarousel = (inserted) => {
    return {
        type: ActionTypes.ADD_IMAGE_CAROUSEL,
        payload: inserted
        };
}

export const removeImageCarousel = (cnt, action) => ({
    type: ActionTypes.DELETE_IMAGE_CAROUSEL,
    action: action,
    payload: cnt
});

/*  ----------------------------------- 
    methods to fetch data from api / cdn
    -----------------------------------  */

export const fetchCategories = () => (dispatch) => {
    dispatch(CategoriesLoading(true));

    return fetch(categoriesUrl)
    .then(
        response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
    .then(response => response.json())
    .then(categories => {

        // Calculate category factor weights by level of explicitness (0 thru 4)
        let i;
        var explicitness = 0;
        var factorweighted_categories = [],

            level0_exclusions = [],
            level1_exclusions = [],
            level2_exclusions = [],
            level3_exclusions = [],
            level4_exclusions = [],

            level0_cnt = 0,
            level1_cnt = 0,
            level2_cnt = 0,
            level3_cnt = 0,
            level4_cnt = 0,

            level0_i = 0,
            level1_i = 0,
            level2_i = 0,
            level3_i = 0,
            level4_i = 0,

            level0_pct = 0,
            level1_pct = 0,
            level2_pct = 0,
            level3_pct = 0,
            level4_pct = 0

        for (i=0; i < categories.length; i++) {
            const x = categories[i]
            explicitness = 0;
            if (x.acf.explicitness) explicitness = x.acf.explicitness
            explicitness = parseInt(explicitness, 10);
            switch (explicitness) {
                case 0:
                    level0_cnt += x.count;
                    level0_i += 1;
                    break;
                case 1:
                    level1_cnt += x.count;
                    level1_i += 1;
                    level0_exclusions.push(x.id);
                    break;
                case 2:
                    level2_cnt += x.count;
                    level2_i += 1;
                    level1_exclusions.push(x.id);
                    break;
                case 3:
                    level3_cnt += x.count;
                    level3_i += 1;
                    level2_exclusions.push(x.id);
                    break;
                case 4:
                    level4_cnt += x.count;
                    level4_i += 1;
                    level3_exclusions.push(x.id);
                    break;
                default:
                    break;
            }
        }
        level2_exclusions = level2_exclusions.concat(level3_exclusions);
        level1_exclusions = level1_exclusions.concat(level2_exclusions);
        level0_exclusions = level0_exclusions.concat(level1_exclusions);

        level4_cnt += level3_cnt + level2_cnt + level1_cnt + level0_cnt;
        level3_cnt += level2_cnt + level1_cnt + level0_cnt;
        level2_cnt += level1_cnt + level0_cnt;
        level1_cnt += level0_cnt;

        level4_i += level3_i + level2_i + level1_i + level0_i;
        level3_i += level2_i + level1_i + level0_i;
        level2_i += level1_i + level0_i;
        level1_i += level0_i;

        level0_pct = (level0_cnt / level0_i) / level0_cnt;
        level1_pct = (level1_cnt / level1_i) / level1_cnt;
        level2_pct = (level2_cnt / level2_i) / level2_cnt;
        level3_pct = (level3_cnt / level3_i) / level3_cnt;
        level4_pct = (level4_cnt / level4_i) / level4_cnt;

        // add percentage weights by level
        for (i=0; i < categories.length; i++) {
            
            var x = categories[i];

            explicitness = 0;
            if (x.acf.explicitness) explicitness = x.acf.explicitness
            explicitness = parseInt(explicitness, 10);

            x.level = explicitness;
            x.level0_item_pct = x.count / level0_cnt;
            x.level1_item_pct = x.count / level1_cnt;
            x.level2_item_pct = x.count / level2_cnt;
            x.level3_item_pct = x.count / level3_cnt;
            x.level4_item_pct = x.count / level4_cnt;

            // (1+(L$49/S9))
            x.level0_weight = (1 + (level0_pct / x.level0_item_pct));
            x.level1_weight = (1 + (level1_pct / x.level1_item_pct));
            x.level2_weight = (1 + (level2_pct / x.level2_item_pct));
            x.level3_weight = (1 + (level3_pct / x.level3_item_pct));
            x.level4_weight = (1 + (level4_pct / x.level4_item_pct));

            delete x.acf;
            factorweighted_categories.push(x);
        }
        const retval = {
            level0_exclusions: level0_exclusions,
            level1_exclusions: level1_exclusions,
            level2_exclusions: level2_exclusions,
            level3_exclusions: level3_exclusions,
            level4_exclusions: level4_exclusions,
            categories: factorweighted_categories
        }
        dispatch(addCategories(retval));
    })
    .catch(error => dispatch(CategoriesFailed(error.message)));

}

export const CategoriesLoading = () => ({
    type: ActionTypes.CATEGORIES_LOADING
});

export const CategoriesFailed = (errmess) => ({
    type: ActionTypes.CATEGORIES_FAILED,
    payload: errmess
});

export const addCategories = (Categories) => ({
    type: ActionTypes.ADD_CATEGORIES,
    payload: Categories
});
