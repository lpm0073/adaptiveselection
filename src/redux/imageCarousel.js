import * as ActionTypes from './ActionTypes';


export const ImageCarousel = (state = {
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_IMAGE_CAROUSEL:
            return {...state, items: [...state.items, action.payload]};

        case ActionTypes.DELETE_IMAGE_CAROUSEL:
            return {...state, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1)
            ]};
            
        default: 
            return state;
    }
};