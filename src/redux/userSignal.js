import * as ActionTypes from './ActionTypes';



export const UserSignal = (state = {
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_USER_SIGNAL:
            const signal = action.payload;
            signal.signal = action.signal;
            const duplicate = [...state.items].filter((item) => (
                item.id === signal.id && 
                item.signal === signal.signal
                ));
            if (duplicate.length === 0) {
                return {...state, items: [...state.items, signal]};
            }
            return {...state, items: [...state.items]};
            
        default: 
            return state;
    }
};

