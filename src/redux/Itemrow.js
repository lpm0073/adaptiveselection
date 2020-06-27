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
            const empty = [...state.items].filter((item) => item.row.length === 0)
                                          .map((item, idx) => {return idx});
            const notEmpty = [];
            for (var i=0; i<[...state.items].length; i++) {
                if (!empty.includes(i)) notEmpty.push([...state.items][i]);
            }
            return {...state, added: false, deleted: true, items: notEmpty};

        case ActionTypes.DELETE_ITEM_CAROUSEL:
            var rows = [...state.items];
            for (i=0; i<rows.length; i++) {
                const idx = rows[i].row.map(function(image) {return image.id;}).indexOf(action.payload.id);
                if (!idx > 0) {
                    var items = [];
                    if (rows[i].length > 1) items = [
                        rows[i].row.slice(0, idx),
                        rows[i].row.slice(idx + 1),
                    ];
                    rows[i].row = items;
                    return {...state, added: false, deleted: true, items: rows};
                }
            }
            return {...state, added: false, deleted: true, items: rows};
                
        default: 
        return state;
    }
};