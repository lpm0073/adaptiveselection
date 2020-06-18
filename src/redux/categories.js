import * as ActionTypes from './ActionTypes';


export const Categories = (state = {
    isLoading: true,
    errMess: null,
    items: []
    }, action) => {
    switch(action.type) {
        case ActionTypes.ADD_CATEGORIES:
            return {...state, isLoading: false, errMess: null, items: action.payload};

        case ActionTypes.CATEGORIES_LOADING:
            return {...state, isLoading: true, errMess: null, items: []};

        case ActionTypes.CATEGORIES_FAILED:
            return {...state, isLoading: false, errMess: action.payload, items: []};

        case ActionTypes.ADD_USER_SIGNAL:
            const oldItems = state.items;
            const categories = oldItems.categories;
            oldItems.categories = processAnalytics(categories, action);
            return {...state, isLoading: false, errMess: null, items: oldItems};
            
        default: 
            return state;
    }
};

const processAnalytics = (categories, action) => {
    if (action) {
        const signal = action.payload;

        for (var j=0; j<signal.api_props.categories.length; j++) {
            var category = getCategory(categories, signal.api_props.categories[j]);
            category = processSignal(action.signal, category);
            categories = setCategory(categories, category);
        }    
    }
    return categories;
}


const processSignal = (signal, category) => {

    switch (signal) {
        case "LIKE": 
        category.user_signals.like += 1;
        break;

        case "UNLIKE": 
        category.user_signals.unlike += 1;
            break;
        case "DISLIKE": 
        category.user_signals.dislike += 1;
            break;
        case "INFO": 
        category.user_signals.info += 1;
            break;
        case "CLOSE": 
        category.user_signals.info += 1;
            break;
        case "CLICK": 
        category.user_signals.info += 1;
            break;
        case "MOVE": 
        category.user_signals.info += 1;
            break;
        case "RESIZE": 
        category.user_signals.info += 1;
            break;
        default: 
        break;
    }
    return category; 
}
const getCategory = (categories, id) => {
    for (var i=0; i<categories.length; i++) {
        if (categories[i].id === id) return categories[i];
    }
}

const setCategory = (categories, category) => {
    for (var i=0; i<categories.length; i++) {
        if (categories[i].id === category.id) categories[i] = category;
        break;
    }
    return categories;
}
