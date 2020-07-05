import * as ActionTypes from './ActionTypes';
import { IMAGE_API_PUBLISHERS_URL } from '../shared/ImagesApi';

const BackendURL = 'https://api.fotomashup.com/wp-json/wp/v2/';
const CategoriesURL = BackendURL + 'categories?per_page=100&_fields=id,count,acf';


/* ------------------------------------------------------------ */
export const addUserSignal = (signal, image) => {
    return {
        type: ActionTypes.ADD_USER_SIGNAL,
        signal: signal,
        payload: image
    }
}
/* ------------------------------------------------------------ */

export const undoItemRow = (i) => {
    return {
        type: ActionTypes.UNDO_ITEMROW,
        payload: i
        };
}
export const redoItemRow = (i) => {
    return {
        type: ActionTypes.REDO_ITEMROW,
        payload: i
        };
}
export const removeItemRow = (n, action) => ({
    type: ActionTypes.DELETE_ITEMROW,
    action: action,
    payload: n
});

export const deleteEmptyItemRow = () => ({
    type: ActionTypes.DELETE_EMPTY_ITEMROW,
    payload: null
});

export const resetItemRow = () => ({
    type: ActionTypes.DELETE_ITEMROW,
    payload: null
});

export const addItemRow = (inserted) => {
    return {
        type: ActionTypes.ADD_ITEMROW,
        payload: inserted
        };
}

/* ------------------------------------------------------------ */
export const undoItemCarousel = (i) => {
    return {
        type: ActionTypes.UNDO_ITEM_CAROUSEL,
        payload: i
        };
}
export const redoItemCarousel = (i) => {
    return {
        type: ActionTypes.REDO_ITEM_CAROUSEL,
        payload: i
        };
}
export const addItemCarousel = (inserted) => {
    return {
        type: ActionTypes.ADD_ITEM_CAROUSEL,
        payload: inserted
        };
}

export const removeItemCarousel = (cnt) => ({
    type: ActionTypes.DELETE_ITEM_CAROUSEL,
    payload: cnt
});

export const resetItemCarousel = () => ({
    type: ActionTypes.RESET_ITEM_CAROUSEL,
    payload: null
});

/*  ----------------------------------- 
    methods to fetch data from api / cdn
    -----------------------------------  */

export const fetchCategories = () => (dispatch) => {
    dispatch(CategoriesLoading(true));

    return fetch(CategoriesURL)
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

            level0_normalization_factor = 0,
            level1_normalization_factor = 0,
            level2_normalization_factor = 0,
            level3_normalization_factor = 0,
            level4_normalization_factor = 0,

            SumOfCountWeight_0 = 0,
            SumOfCountWeight_1 = 0,
            SumOfCountWeight_2 = 0,
            SumOfCountWeight_3 = 0,
            SumOfCountWeight_4 = 0;

        

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

        // might delete?
        /*
        level0_pct = (level0_cnt / level0_i) / level0_cnt;
        level1_pct = (level1_cnt / level1_i) / level1_cnt;
        level2_pct = (level2_cnt / level2_i) / level2_cnt;
        level3_pct = (level3_cnt / level3_i) / level3_cnt;
        level4_pct = (level4_cnt / level4_i) / level4_cnt;
        */

        // add percentage weights by level
        for (i=0; i < categories.length; i++) {
            
            var x = categories[i];

            // initialize analytics data
            x.user_signals = {
                like: 0,
                unlike: 0,
                dislike: 0,
                info: 0,
                close: 0,
                click: 0,
                move: 0,
                resize: 0
            }
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
            /*
            x.level0_weight = (1 + (level0_pct / x.level0_item_pct));
            x.level1_weight = (1 + (level1_pct / x.level1_item_pct));
            x.level2_weight = (1 + (level2_pct / x.level2_item_pct));
            x.level3_weight = (1 + (level3_pct / x.level3_item_pct));
            x.level4_weight = (1 + (level4_pct / x.level4_item_pct));
            */

            x.level0_count_weight = x.count / (level0_cnt / level0_i);
            x.level1_count_weight = x.count / (level1_cnt / level1_i);
            x.level2_count_weight = x.count / (level2_cnt / level2_i);
            x.level3_count_weight = x.count / (level3_cnt / level3_i);
            x.level4_count_weight = x.count / (level4_cnt / level4_i);

            // initialize scoring metric
            x.factor_score = 0;

            delete x.acf;
            factorweighted_categories.push(x);
        }
        // normalize factor results (step 1)
        for (i=0; i < factorweighted_categories.length; i++) {
            SumOfCountWeight_0 += factorweighted_categories[i].level0_count_weight;
            SumOfCountWeight_1 += factorweighted_categories[i].level1_count_weight;
            SumOfCountWeight_2 += factorweighted_categories[i].level2_count_weight;
            SumOfCountWeight_3 += factorweighted_categories[i].level3_count_weight;
            SumOfCountWeight_4 += factorweighted_categories[i].level4_count_weight;
        }

        level0_normalization_factor = SumOfCountWeight_0 / level0_i;
        level1_normalization_factor = SumOfCountWeight_1 / level1_i;
        level2_normalization_factor = SumOfCountWeight_2 / level2_i;
        level3_normalization_factor = SumOfCountWeight_3 / level3_i;
        level4_normalization_factor = SumOfCountWeight_4 / level4_i;


        for (i=0; i < factorweighted_categories.length; i++) {
            factorweighted_categories[i].level0_weight = factorweighted_categories[i].level0_count_weight / level0_normalization_factor;
            factorweighted_categories[i].level1_weight = factorweighted_categories[i].level1_count_weight / level1_normalization_factor;
            factorweighted_categories[i].level2_weight = factorweighted_categories[i].level2_count_weight / level2_normalization_factor;
            factorweighted_categories[i].level3_weight = factorweighted_categories[i].level3_count_weight / level3_normalization_factor;
            factorweighted_categories[i].level4_weight = factorweighted_categories[i].level4_count_weight / level4_normalization_factor;
        }

        const retval = {
            level0_exclusions: level0_exclusions,
            level1_exclusions: level1_exclusions,
            level2_exclusions: level2_exclusions,
            level3_exclusions: level3_exclusions,
            level4_exclusions: level4_exclusions,
            level0_i: level0_i,
            level1_i: level1_i,
            level2_i: level2_i,
            level3_i: level3_i,
            level4_i: level4_i,
            level0_normalization_factor: level0_normalization_factor,
            level1_normalization_factor: level1_normalization_factor,
            level2_normalization_factor: level2_normalization_factor,
            level3_normalization_factor: level3_normalization_factor,
            level4_normalization_factor: level4_normalization_factor,
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


/* ------------------------------------------------------------ */

export const PublishersLoading = () => ({
    type: ActionTypes.PUBLISHERS_LOADING
});

export const PublishersFailed = (errmess) => ({
    type: ActionTypes.PUBLISHERS_FAILED,
    payload: errmess
});

export const addPublishers = (Publishers) => ({
    type: ActionTypes.ADD_PUBLISHERS,
    payload: Publishers
});


export const fetchPublishers = () => (dispatch) => {
    dispatch(PublishersLoading(true));

    return fetch(IMAGE_API_PUBLISHERS_URL)
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
    .then(publishers => {
        dispatch(addPublishers(publishers));
    })
    .catch(error => dispatch(PublishersFailed(error.message)));
}
