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
            return {...state, added: false, deleted: true, items: [
                ...state.items.slice(action.payload - 1),
            ]};
        
        case ActionTypes.RESET_ITEMROW:
            return {...state, added: false, deleted: true, items: []};

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

        case ActionTypes.DELETE_EMPTY_ITEMROW:
            const empty = [...state.items]
                            .filter((item) => item.row.length === 0)
                            .map((item, idx) => {return idx});
            const notEmpty = [...state.items]
                            .filter((item, idx) => !empty.includes(idx));

            return {...state, added: false, deleted: true, items: notEmpty};

        case ActionTypes.DELETE_ITEM_CAROUSEL:
            const newRows = [...state.items].filter((item) => item.id !== action.payload.id);
            return {...state, added: false, deleted: true, items: newRows};

        default: 
        return state;
    }
};