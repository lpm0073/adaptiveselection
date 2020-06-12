import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Specialties } from './specialties';
import { Categories } from './categories';
import { HomePageRedux } from './homePage.js';

import thunk from 'redux-thunk';
import logger from 'redux-thunk';


export const ConfigureStore = () => {

    const store = createStore(
        
        combineReducers({
            specialties: Specialties,
            categories: Categories,
            homePage: HomePageRedux
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};