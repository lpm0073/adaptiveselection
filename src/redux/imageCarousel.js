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
            if (action.action === "quantity")
                return {...state, added: false, deleted: true, items: [
                    ...state.items.slice(action.payload)
                ]};
            if (action.action === "item")
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};
            break;
            
        default: 
            return state;
    }
};