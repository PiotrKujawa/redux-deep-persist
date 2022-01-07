import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { createMemoryStorage } from 'storage-memory';
import { autoMergeDeep, createWhitelist, createBlacklist } from '../src';
import stateConfig from './reducers/config';
import { SET_STATE, WHITELIST_TYPE } from './constants';
import {
    staticReducerInitialState,
    staticReducerPersistedState,
    staticReducerFinalState,
} from './reducers/staticReducer';

import rootReducer from './reducers';

const initialState: { [key: string]: any } = {};
const modifiedState: { [key: string]: any } = {};
const expectedState: { [key: string]: any } = {};

stateConfig.forEach(({ initial, modified, expected }, index) => {
    initialState['example' + index] = initial;
    modifiedState['example' + index] = modified;
    expectedState['example' + index] = expected;
});

const sleep = (timeout: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });

const memoryStorage = createMemoryStorage();

const persistConfig = {
    key: 'root',
    storage: memoryStorage,
    transforms: stateConfig.map(({ persistConfig: config, type }, index) => {
        return type === WHITELIST_TYPE
            ? createWhitelist('example' + index, config)
            : createBlacklist('example' + index, config);
    }),
    stateReconciler: autoMergeDeep,
    // debug: true,
};

const persistedReducer = persistReducer<any>(persistConfig, rootReducer);
// createStore will cause an open handle issue, but it's nothing to worry about
// tests are running with --forceExit flag
let store = createStore(persistedReducer);

test('has initial state', async () => {
    persistStore(store);
    const state = store.getState();
    initialState['_persist'] = {
        rehydrated: false,
        version: -1,
    };
    initialState['static'] = staticReducerInitialState;
    expect(state).toEqual(initialState);
});

test('has modified state after dispatching an action', async () => {
    store.dispatch({ type: SET_STATE });
    modifiedState['_persist'] = {
        rehydrated: true,
        version: -1,
    };
    // this piece of state is modified by reducer during SET_STATE action and should be persisted
    modifiedState['static'] = staticReducerPersistedState;
    const state = store.getState();
    expect(state).toEqual(modifiedState);
});

test('rehydrates values based on a whitelist and blacklist configuration', async () => {
    await sleep(1000);

    // it's like opening an app again
    store = createStore(persistedReducer);

    persistStore(store);

    // let's check if storage contains static reducer persisted data
    const storage = await memoryStorage.getItem('persist:root');
    const parsedStorage = JSON.parse(storage);
    const persistedStatePiece = JSON.parse(parsedStorage.static);
    expect(persistedStatePiece).toEqual(staticReducerPersistedState);

    let state = store.getState();
    initialState['_persist'] = {
        rehydrated: false,
        version: -1,
    };
    initialState['static'] = staticReducerInitialState;

    // expected state before rehydration should be equal to initial
    expect(state).toEqual(initialState);

    // wait for rehydrate
    await sleep(1000);

    state = store.getState();
    expectedState['_persist'] = {
        rehydrated: true,
        version: -1,
    };
    // final state, result of autoMergeDeep, must contain persisted values merged with these ones modified by reducer on rehydrate action - it's like skip in autoMerge lv1 and lv2
    expectedState['static'] = staticReducerFinalState;

    // expected state after rehydration
    expect(state).toEqual(expectedState);
});
