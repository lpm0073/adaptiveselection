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
            
        default: 
            return state;
    }
};