import * as ActionTypes from './ActionTypes';


export const ImageCarousel = (state = {
    added: false,
    deleted: false,
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_IMAGE_CAROUSEL:
            return {...state, added: true, deleted: false, items: [...state.items, action.payload]};

        case ActionTypes.DELETE_IMAGE_CAROUSEL:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(action.payload)
            ]};
            
        default: 
            return state;
    }
};