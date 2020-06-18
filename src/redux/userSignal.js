import * as ActionTypes from './ActionTypes';


export const UserSignal = (state = {
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_USER_SIGNAL:
            const image = action.payload;
            image.signal = action.signal;
            const duplicate = [...state.items].filter((item) => (
                item.id === image.id && 
                item.signal === image.signal
                ));
            if (image.signal === "LIKE") console.log("UserSignal its a LIKE", image, duplicate);
            if (duplicate.length === 0) return {...state, items: [...state.items, image]};
            return {...state, items: [...state.items]};
            
        default: 
            return state;
    }
};