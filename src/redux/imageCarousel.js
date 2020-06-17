import * as ActionTypes from './ActionTypes';


export const ImageCarousel = (state = {
    items: []
    }, action) => {
    switch(action.type) {
        case ActionTypes.ADD_IMAGE_CAROUSEL:
            return {...state, items: action.payload};

        case ActionTypes.DELETE_IMAGE_CAROUSEL:
            return {...state, items: action.payload};
            
        default: 
            return state;
    }
};