import * as ActionTypes from './ActionTypes';


export const ItemCarousel = (state = {
    added: false,
    deleted: false,
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_ITEM_CAROUSEL:
            if (Array.isArray(action.payload)) {
                return {...state, added: true, deleted: false, items: [...state.items].concat(action.payload)};
            }
            return {...state, added: true, deleted: false, items: [...state.items, action.payload]};

        case ActionTypes.DELETE_ITEM_CAROUSEL:
            if (action.action === "quantity")
                return {...state, added: false, deleted: true, items: [
                    ...state.items.slice(action.payload)
                ]};
            if (action.action === "item") {
                console.log("ItemCarousel() - delete", action.payload.id);
                const idx = [...state.items].map(function(image) {return image.id;}).indexOf(action.payload.id);
                if (!idx > 0)  
                    return {...state, added: false, deleted: true, items: [
                        ...state.items.slice(0, idx),
                        ...state.items.slice(idx + 1),
                    ]};
                else return {...state, added: false, deleted: true, items: [...state.items]};
            }
            break;
        
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