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
                const categoryId = publishers[i].id;
                const publisher = publishers[i].name;
                const required = publishers[i].acf.hasOwnProperty("required") ? publishers[i].acf.required : false;
                const filtered = publishers[i].acf.hasOwnProperty("filtered") ? publishers[i].acf.filtered : false;
                const publication = {
                    required: required,
                    publisher: publisher,
                    id: categoryId,
                    filtered: filtered
                }
                if (publication.id !== 1 && !publication.required) items.push(publication);
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

