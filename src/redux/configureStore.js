import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Categories } from './categories';
import { HomePageRedux } from './homePage.js';

import thunk from 'redux-thunk';
import logger from 'redux-thunk';


export const ConfigureStore = () => {

    const store = createStore(
        
        combineReducers({
            categories: Categories,
            homePage: HomePageRedux
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};