// https://github.com/omnidan/redux-undo

import { createStore, combineReducers, applyMiddleware } from 'redux';
import undoable from 'redux-undo';

import { Categories } from './categories';
import { ItemCarousel } from './itemCarousel';
import { UserSignal} from './userSignal';

import thunk from 'redux-thunk';
import logger from 'redux-thunk';


export const ConfigureStore = () => {

    const store = createStore(
        
        combineReducers({
            categories: Categories,
            itemCarousel: undoable(ItemCarousel, {
                undoType: 'UNDO_ITEM_CAROUSEL',
                redoType: 'REDO_ITEM_CAROUSEL',
              }),
            userSignals: UserSignal
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};