import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Categories } from './categories';
import { ImageCarousel } from './imageCarousel';
import { HomePageRedux } from './homePage.js';

import thunk from 'redux-thunk';
import logger from 'redux-thunk';


export const ConfigureStore = () => {

    const store = createStore(
        
        combineReducers({
            categories: Categories,
            homePage: HomePageRedux,
            imageCarousel: ImageCarousel
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};