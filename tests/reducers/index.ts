import { combineReducers } from 'redux';
import reducers from './dynamicReducer';
import staticReducer from './staticReducer';

const rootReducer = combineReducers({
    ...reducers,
    static: staticReducer,
});

export default rootReducer;
