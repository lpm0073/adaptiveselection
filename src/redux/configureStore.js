// https://github.com/omnidan/redux-undo

import { createStore, combineReducers, applyMiddleware } from 'redux';
import undoable from 'redux-undo';

import { Categories } from './categories';
import { Publishers } from './publishers';
import { ItemCarousel } from './itemCarousel';
import { UserSignal} from './userSignal';
import { ItemRow } from './ItemRow';

import thunk from 'redux-thunk';
import logger from 'redux-thunk';


export const ConfigureStore = () => {

    const store = createStore(
        
        combineReducers({
            categories: Categories,
            publishers: Publishers,
            itemRow: undoable(ItemRow, {
                undoType: 'UNDO_ITEMROW',
                redoType: 'REDO_ITEMROW'
            }),
            itemCarousel: undoable(ItemCarousel, {
                undoType: 'UNDO_ITEM_CAROUSEL',
                redoType: 'REDO_ITEM_CAROUSEL'
              }),
            userSignals: UserSignal
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};