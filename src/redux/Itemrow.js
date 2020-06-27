import * as ActionTypes from './ActionTypes';


export const ItemRow = (state = {
    added: false,
    deleted: false,
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_ITEMROW:
            if (Array.isArray(action.payload)) {
                return {...state, added: true, deleted: false, items: [...state.items].concat(action.payload)};
            }
            return {...state, added: true, deleted: false, items: [...state.items, action.payload]};

        case ActionTypes.DELETE_ITEMROW:
            console.log("Row() - delete", action.payload);
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(action.payload - 1),
            ]};
        
        case ActionTypes.UNDO_ITEMROW:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};

        case ActionTypes.REDO_ITEMROW:
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(0, action.payload),
                ...state.items.slice(action.payload + 1),
            ]};

            
        default: 
        return state;
    }
};