import * as ActionTypes from './ActionTypes';


export const ImageCarousel = (state = {
    added: false,
    deleted: false,
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_IMAGE_CAROUSEL:
            const duplicates = [...state.items].filter((item) => item.id === action.payload.id);
            if (duplicates.length > 0) console.log("ImageCarousel() - duplicates", duplicates.length, action, state);
            return {...state, added: true, deleted: false, items: [...state.items, action.payload]};

        case ActionTypes.DELETE_IMAGE_CAROUSEL:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1)
            ]};
            
        default: 
            return state;
    }
};