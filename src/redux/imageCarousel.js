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
            if (action.action === "item") {
                const idx = [...state.items].map(function(image) {return image.id;}).indexOf(action.payload.id);
                if (!idx === 0)  
                    return {...state, added: false, deleted: true, items: [
                        ...state.items.slice(0, idx),
                        ...state.items.slice(idx + 1),
                    ]};
            }
            break;
        
        case ActionTypes.UNDO_IMAGE_CAROUSEL:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};

        case ActionTypes.REDO_IMAGE_CAROUSEL:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};

            default: 
            return state;
    }
};