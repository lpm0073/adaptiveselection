import { createStore, combineReducers, applyMiddleware } from 'redux';
import { ReduxUndo } from 'redux-undo'; 
import undoable from 'redux-undo';

import { Categories } from './categories';
import { ImageCarousel } from './imageCarousel';
import { UserSignal} from './userSignal';

import thunk from 'redux-thunk';
import logger from 'redux-thunk';


export const ConfigureStore = () => {

    const store = createStore(
        
        combineReducers({
            categories: Categories,
            imageCarousel: undoable(ImageCarousel, {
                undoType: 'UNDO_IMAGE_CAROUSEL',
                redoType: 'REDO_IMAGE_CAROUSEL',
              }),
            userSignals: UserSignal
        }),
        applyMiddleware(thunk, logger)
    );

    return store;
};