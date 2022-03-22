import { createMemoryStorage } from 'storage-memory';
import { createBlacklist, createWhitelist, autoMergeDeep, getTransforms, getPersistConfig } from '../src';
import rootReducer from './reducers';
import stateConfig from './reducers/config';
import { VALUE } from './constants';
import { PLACEHOLDER_UNDEFINED } from '../src/constants';
import { ConfigType } from '../src/types';

const memoryStorage = createMemoryStorage();

const STATE_KEY = 'stateKey';
const inboundObj1 = {
    p1: {
        p2: VALUE,
        p3: {
            p4: VALUE,
            p5: [
                undefined,
                VALUE,
                VALUE,
                {
                    p6: {
                        p7: VALUE,
                        p8: VALUE,
                    },
                },
            ],
        },
    },
};

const inboundObj2 = {
    p1: {
        p2: null,
        p3: [undefined, null, VALUE, null, undefined],
    },
};

const inboundObj3 = [VALUE, undefined, null, VALUE, undefined, null, VALUE];
const outboundObj3 = [null, null, null, VALUE, PLACEHOLDER_UNDEFINED, null, VALUE];

const initialState = {
    p1: {
        p2: null,
        p3: {
            p4: null,
            p5: [
                'initial value',
                'initial value',
                undefined,
                {
                    p6: {
                        p7: null,
                        p8: null,
                    },
                },
            ],
        },
    },
};

const inboundObj4 = {
    p1: {
        p2: VALUE,
        p3: {
            p4: VALUE,
            p5: [
                PLACEHOLDER_UNDEFINED,
                undefined,
                null,
                {
                    p6: {
                        p7: VALUE,
                        p8: VALUE,
                    },
                },
            ],
        },
    },
};

test('createWhitelist works as expected', () => {
    const transformFn1 = createWhitelist(STATE_KEY, ['p1.p2']);
    const transformFn2 = createWhitelist(STATE_KEY, ['p1.p2', 'p1.p3.0', 'p1.p3.2']);

    const toPersist1 = transformFn1.in(inboundObj1, STATE_KEY);
    const fromPersist1 = transformFn1.out(toPersist1, STATE_KEY);

    const toPersist2 = transformFn2.in(inboundObj2, STATE_KEY);
    const fromPersist2 = transformFn2.out(toPersist2, STATE_KEY);

    const expected1 = { p1: { p2: VALUE } };
    const expected2 = { p1: { p2: null, p3: [PLACEHOLDER_UNDEFINED, undefined, VALUE] } };

    expect(toPersist1).toEqual(expected1);
    expect(fromPersist1).toEqual(expected1);

    expect(toPersist2).toEqual(expected2);
    expect(fromPersist2).toEqual(expected2);
});

test('createBlacklist works as expected', () => {
    const transformFn3 = createBlacklist(STATE_KEY, ['p1.p2', 'p1.p3.p5.2', 'p1.p3.p5.3.p6.p8']);
    const transformFn4 = createBlacklist(STATE_KEY, ['0', '1', '2']);

    const toPersist3 = transformFn3.in(inboundObj1, STATE_KEY);
    const fromPersist3 = transformFn3.out(toPersist3, STATE_KEY);

    const toPersist4 = transformFn4.in(inboundObj3, STATE_KEY);
    const fromPersist4 = transformFn4.out(outboundObj3, STATE_KEY);

    const expected3 = {
        p1: {
            p3: {
                p4: VALUE,
                p5: [
                    PLACEHOLDER_UNDEFINED,
                    VALUE,
                    undefined,
                    {
                        p6: {
                            p7: VALUE,
                        },
                    },
                ],
            },
        },
    };

    const expected4 = [undefined, undefined, undefined, VALUE, PLACEHOLDER_UNDEFINED, null, VALUE];

    expect(toPersist3).toEqual(expected3);
    expect(fromPersist3).toEqual(expected3);

    expect(toPersist4).toEqual(expected4);
    expect(fromPersist4).toEqual(expected4);
});

test('autoMergeDeep works as expected', () => {
    // switching off console.log
    global.console = {
        ...console,
        log: jest.fn(),
    };

    const value = autoMergeDeep(inboundObj4, initialState, initialState, {
        debug: false,
        storage: memoryStorage,
        key: 'root',
    });
    const expected = {
        p1: {
            p2: VALUE,
            p3: {
                p4: VALUE,
                p5: [
                    undefined,
                    'initial value',
                    null,
                    {
                        p6: {
                            p7: VALUE,
                            p8: VALUE,
                        },
                    },
                ],
            },
        },
    };

    expect(value).toEqual(expected);

    // should throw error if an original redux-persist config contains whitelist or blacklist
    expect(() => {
        autoMergeDeep(
            {},
            {},
            {},
            {
                key: 'root',
                storage: memoryStorage,
                whitelist: ['key'],
                blacklist: ['key'],
                debug: true,
            },
        );
    }).toThrow();

    // should return reduced state
    expect(
        autoMergeDeep(
            { a: 1 },
            { a: 1 },
            { a: 2 },
            {
                key: 'root',
                storage: memoryStorage,
                debug: true,
            },
        ),
    ).toEqual({ a: 2 });

    // switching on console.log
    global.console = {
        ...console,
        log: console.debug,
    };
});

test('getTransforms works as expected', () => {
    const whitelistGroup = [
        {
            key1: ['a'],
        },
        {
            key2: ['b'],
        },
        {
            key3: ['c'],
        },
    ];

    const blacklistGroup = [
        {
            key4: ['a'],
        },
        {
            key5: ['b'],
        },
    ];

    const inbound = { a: 1, b: 2, c: 3 };

    const whitelistTransforms = getTransforms(ConfigType.WHITELIST, whitelistGroup);
    const blacklistTransforms = getTransforms(ConfigType.BLACKLIST, blacklistGroup);

    expect(typeof whitelistTransforms[0].in).toBe('function');
    expect(typeof whitelistTransforms[0].out).toBe('function');
    expect(whitelistTransforms[0].deepPersistKey).toBe('key1');

    expect(whitelistTransforms[0].in(inbound, 'key1')).toEqual({ a: 1 });
    expect(whitelistTransforms[1].in(inbound, 'key2')).toEqual({ b: 2 });
    expect(whitelistTransforms[2].in(inbound, 'key3')).toEqual({ c: 3 });

    expect(typeof blacklistTransforms[0].in).toBe('function');
    expect(typeof blacklistTransforms[0].out).toBe('function');
    expect(blacklistTransforms[0].deepPersistKey).toBe('key4');

    expect(blacklistTransforms[0].in(inbound, 'key4')).toEqual({ b: 2, c: 3 });
    expect(blacklistTransforms[1].in(inbound, 'key5')).toEqual({ a: 1, c: 3 });

    expect(whitelistTransforms).toHaveLength(3);
    expect(blacklistTransforms).toHaveLength(2);
});

test('getPersistConfig works as expected', () => {
    const whitelistKeys = ['example1', 'example3', 'example7'];

    const value = getPersistConfig({
        key: 'root',
        storage: memoryStorage,
        rootReducer,
        whitelist: whitelistKeys,
    });

    // these must be separate arrays to keep an order in matcher method
    const whitelistTransforms = stateConfig
        .map((_example, index) => {
            const key = 'example' + index;
            if (whitelistKeys.includes(key)) {
                return createWhitelist(key);
            }
            return undefined;
        })
        .filter((t) => t);

    const blacklistTransforms = stateConfig
        .map((_example, index) => {
            const key = 'example' + index;
            if (!whitelistKeys.includes(key)) {
                return createBlacklist(key);
            }
            return undefined;
        })
        .filter((t) => t);

    expect(JSON.stringify(value)).toEqual(
        JSON.stringify({
            key: 'root',
            stateReconciler: autoMergeDeep,
            storage: memoryStorage,
            transforms: [...whitelistTransforms, ...blacklistTransforms, createBlacklist('static')],
        }),
    );
});
