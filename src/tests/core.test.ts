import { createBlacklist, createWhitelist, autoMergeDeep } from '../index';
import { VALUE } from './constants';
import { PLACEHOLDER_UNDEFINED } from '../constants';

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
    const transformFn3 = createBlacklist(STATE_KEY, ['p1.p2', 'p1.p3.p5.2', 'p1.p3.p5.3.p6.p8']);
    const transformFn4 = createBlacklist(STATE_KEY, ['0', '1', '2']);

    const toPersist1 = transformFn1.in(inboundObj1, STATE_KEY);
    const fromPersist1 = transformFn1.out(toPersist1, STATE_KEY);

    const toPersist2 = transformFn2.in(inboundObj2, STATE_KEY);
    const fromPersist2 = transformFn2.out(toPersist2, STATE_KEY);

    const toPersist3 = transformFn3.in(inboundObj1, STATE_KEY);
    const fromPersist3 = transformFn3.out(toPersist3, STATE_KEY);

    const toPersist4 = transformFn4.in(inboundObj3, STATE_KEY);
    const fromPersist4 = transformFn4.out(outboundObj3, STATE_KEY);

    const expected1 = { p1: { p2: VALUE } };
    const expected2 = { p1: { p2: null, p3: [PLACEHOLDER_UNDEFINED, undefined, VALUE] } };
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

    expect(toPersist1).toEqual(expected1);
    expect(fromPersist1).toEqual(expected1);

    expect(toPersist2).toEqual(expected2);
    expect(fromPersist2).toEqual(expected2);

    expect(toPersist3).toEqual(expected3);
    expect(fromPersist3).toEqual(expected3);

    expect(toPersist4).toEqual(expected4);
    expect(fromPersist4).toEqual(expected4);
});

test('autoMergeDeep works as expected', () => {
    const value = autoMergeDeep<any>(inboundObj4, initialState, initialState, { debug: false });
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
});
