import * as ActionTypes from './ActionTypes';


export const ItemCarousel = (state = {
    added: false,
    deleted: false,
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_ITEM_CAROUSEL:
            const ids = [...state.items].map((item) => {return item.id});
            if (Array.isArray(action.payload)) {
                const newItems = action.payload.filter((id) => !ids.includes(id));
                return {...state, added: true, deleted: false, items: [...state.items].concat(newItems)};
            }
            const dup = ids.filter((id) => id === action.payload.id);
            if (dup.length === 0) return {...state, added: true, deleted: false, items: [...state.items, action.payload]};
            else return {...state, added: true, deleted: false, items: [...state.items]};

        case ActionTypes.DELETE_ITEM_CAROUSEL:
            const idx = [...state.items].map(function(image) {return image.id;}).indexOf(action.payload.id);
            if (!idx > 0)  
                return {...state, added: false, deleted: true, items: [
                    ...state.items.slice(0, idx),
                    ...state.items.slice(idx + 1),
                ]};
            else return {...state, added: false, deleted: true, items: [...state.items]};
        
        case ActionTypes.RESET_ITEM_CAROUSEL:
            return {...state, added: false, deleted: true, items: []};

        case ActionTypes.UNDO_ITEM_CAROUSEL:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};

        case ActionTypes.REDO_ITEM_CAROUSEL:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};

            default: 
            return state;
    }
};