import { VALUE, INITIAL_VALUE, WHITELIST_TYPE, BLACKLIST_TYPE } from '../constants';

export default [
    {
        type: WHITELIST_TYPE,
        initial: {
            p1: {
                p2: {
                    p3: false,
                    p4: null,
                },
            },
        },
        modified: {
            p1: {
                p2: {
                    p3: true,
                    p4: VALUE,
                    p5: {
                        p6: VALUE,
                        p7: VALUE,
                    },
                },
            },
        },
        expected: {
            p1: {
                p2: {
                    p3: true,
                    p4: null,
                    p5: {
                        p7: VALUE,
                    },
                },
            },
        },
        persistConfig: ['p1.p2.p3', 'p1.p2.pa', 'p1.p2.p5.p7', 'p1.p2.p5.p8', 'p1.p2.p5.p9'],
    },
    // --------------------------
    {
        type: WHITELIST_TYPE,
        initial: [null, null, INITIAL_VALUE],
        modified: ['index 0', 'index 1', 'index 2'],
        expected: [null, 'index 1', INITIAL_VALUE],
        persistConfig: ['1'],
    },
    // --------------------------
    {
        type: WHITELIST_TYPE,
        initial: {
            p1: null,
            p2: {
                p3: false,
                p4: {
                    p5: null,
                    p6: {
                        p7: null,
                    },
                },
            },
        },
        modified: {
            p1: VALUE,
            p2: {
                p3: true,
                p4: {
                    p5: VALUE,
                    p6: {
                        p7: VALUE,
                    },
                },
            },
        },
        expected: {
            p1: VALUE,
            p2: {
                p3: false,
                p4: {
                    p5: VALUE,
                    p6: {
                        p7: VALUE,
                    },
                },
            },
        },
        persistConfig: ['p1', 'p2.p4.p5', 'p2.p4.p6'],
    },
    // --------------------------
    {
        type: WHITELIST_TYPE,
        initial: {
            p1: {
                p2: null,
                p3: {
                    p4: null,
                    p5: [
                        undefined,
                        INITIAL_VALUE,
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
        },
        modified: {
            p1: {
                p2: VALUE,
                p3: {
                    p4: VALUE,
                    p5: [
                        VALUE,
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
        },
        expected: {
            p1: {
                p2: 'some value',
                p3: {
                    p4: null,
                    p5: [
                        undefined,
                        'some initial',
                        'some value',
                        {
                            p6: {
                                p7: null,
                                p8: 'some value',
                            },
                        },
                    ],
                },
            },
        },
        persistConfig: ['p1.p2', 'p1.p3.p5.2', 'p1.p3.p5.3.p6.p8'],
    },
    // --------------------------
    {
        type: WHITELIST_TYPE,
        initial: {
            p1: {
                p2: {
                    p3: false,
                    p4: null,
                },
            },
        },
        modified: {
            p1: {
                p2: {
                    p3: true,
                    p4: VALUE,
                    p5: {
                        p6: VALUE,
                        p7: {
                            p8: VALUE,
                        },
                    },
                },
            },
        },
        expected: {
            p1: {
                p2: {
                    p3: true,
                    p4: null,
                    p5: {
                        p7: {
                            p8: VALUE,
                        },
                    },
                },
            },
        },
        persistConfig: ['p1.p2.p3', 'p1.p2.p5.p7.p8'],
    },
    // --------------------------
    {
        type: WHITELIST_TYPE,
        initial: [null, null, null, [null, INITIAL_VALUE, null, null], null],
        modified: [VALUE, VALUE, VALUE, [null, VALUE, VALUE, VALUE], VALUE],
        expected: [VALUE, null, VALUE, [null, INITIAL_VALUE, VALUE, null], null],
        persistConfig: ['0', '2', '3.2'],
    },
    // --------------------------
    {
        type: BLACKLIST_TYPE,
        initial: {
            p1: {
                p2: {
                    p3: false,
                    p4: null,
                },
            },
        },
        modified: {
            p1: {
                p2: {
                    p3: true,
                    p4: VALUE,
                    p5: {
                        p6: VALUE,
                        p7: VALUE,
                        p8: VALUE,
                    },
                },
            },
        },
        expected: {
            p1: {
                p2: {
                    p3: true,
                    p4: null,
                    p5: {
                        p6: VALUE,
                        p8: VALUE,
                    },
                },
            },
        },
        persistConfig: ['p1.p2.p4', 'p1.p2.p5.p7'],
    },
    // --------------------------
    {
        type: BLACKLIST_TYPE,
        initial: [null, null, INITIAL_VALUE, null],
        modified: [VALUE, VALUE, VALUE, VALUE],
        expected: [VALUE, null, INITIAL_VALUE, VALUE],
        persistConfig: ['1', '2'],
    },
    // --------------------------
    {
        type: BLACKLIST_TYPE,
        initial: [null, null, INITIAL_VALUE, [null, INITIAL_VALUE, null, null], null],
        modified: [VALUE, VALUE, VALUE, [VALUE, VALUE, VALUE, VALUE], VALUE],
        expected: [null, null, VALUE, [VALUE, INITIAL_VALUE, null, VALUE], VALUE],
        persistConfig: ['0', '1', '3.1', '3.2'],
    },
];
