import { REHYDRATE, SET_STATE } from '../constants';

export const staticReducerInitialState = {
    a: {
        b: {
            c: 'initial value',
            d: ['initial value', 'initial value', 'initial value'],
        },
    },
};

export const staticReducerModifiedState = {
    a: {
        b: {
            c: 'initial value',
            d: ['modified value', undefined, 'initial value'],
            e: 'new value',
        },
    },
};

export const staticReducerPersistedState = {
    a: {
        b: {
            c: 'persisted value',
            d: ['persisted value', 'persisted value', 'persisted value'],
            e: 'persisted value',
        },
    },
};

export const staticReducerFinalState = {
    a: {
        b: {
            c: 'persisted value',
            d: ['modified value', undefined, 'persisted value'],
            e: 'new value',
        },
    },
};

export default function (state = staticReducerInitialState, { type }: { type: string }) {
    switch (type) {
        case REHYDRATE: {
            return staticReducerModifiedState;
        }
        case SET_STATE: {
            return staticReducerPersistedState;
        }
        default:
            return state;
    }
}
