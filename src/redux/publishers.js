import * as ActionTypes from './ActionTypes';

export const Publishers = (state = {
    items: []
    }, action) => {
        switch(action.type) {
        case ActionTypes.ADD_PUBLISHERS:
            const publishers = action.payload;
            var items = [];

            // transform the json object from the REST get into something
            // easier to work with.
            for (var i=0; i<publishers.length; i++) {
                const publication = {
                    required: publishers[i].acf.hasOwnProperty("required") ? publishers[i].acf.required : false,
                    publisher: publishers[i].name,
                    id: publishers[i].id,
                    filtered: publishers[i].acf.hasOwnProperty("filtered") ? publishers[i].acf.filtered : false
                }
                if (publication.id !== 1) items.push(publication);
            }
            return {...state, isLoading: false, errMess: null, items: items};

        case ActionTypes.PUBLISHERS_LOADING:
            return {...state, isLoading: true, errMess: null, items: []};

        case ActionTypes.PUBLISHERS_FAILED:
            return {...state, isLoading: false, errMess: action.payload, items: []};
                
        default: 
            return state;
    }
};

