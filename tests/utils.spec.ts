import {
    isObjectLike,
    isPlainObject,
    isArray,
    isIntegerString,
    isString,
    isLength,
    isEmpty,
    isDate,
    cloneDeep,
    getCircularPath,
    path,
    assocPath,
    mergeDeep,
    dissocPath,
    preserveUndefined,
    difference,
    unique,
    singleTransformValidator,
    transformsValidator,
    findDuplicatesAndSubsets,
} from '../src/utils';

import { PLACEHOLDER_UNDEFINED, PACKAGE_NAME } from '../src/constants';
import { ConfigType } from '../src/types';

const obj1 = {
    a: {
        b: {
            c: {
                d: {
                    e: 'some value',
                    f: [0, 1, 2],
                },
            },
        },
    },
    h: 'some string 1',
};

const obj2 = {
    a: {
        b: {
            c: {
                d: {
                    e: 'new value',
                    f: [0, 'some value', 2],
                },
            },
        },
    },
    g: 'some string 2',
};

const array1 = ['value 1', 'value 2', 'value 3'];
const array2 = [undefined, null, 'value 4'];
const array3 = [null, PLACEHOLDER_UNDEFINED, 'value 5'];
const array4 = [null, null, null];
const array5 = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
];
const array6 = [undefined, [undefined, null, 'value 1'], [undefined, null, [undefined, 'value 2']]];

test('isObjectLike', () => {
    expect(isObjectLike({})).toBe(true);
    expect(isObjectLike([])).toBe(true);
    expect(isObjectLike('')).toBe(false);
    expect(isObjectLike(jest.fn)).toBe(false);
    expect(isObjectLike(true)).toBe(false);
    expect(isObjectLike(false)).toBe(false);
    expect(isObjectLike(null)).toBe(false);
    expect(isObjectLike(undefined)).toBe(false);
});

test('isPlainObject', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject('')).toBe(false);
    expect(isPlainObject(jest.fn)).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(false)).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
});

test('isArray', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isArray('')).toBe(false);
    expect(isArray(jest.fn)).toBe(false);
    expect(isArray(true)).toBe(false);
    expect(isArray(false)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
    expect(isArray({ length: '' })).toBe(false);
});

test('isIntegerString', () => {
    expect(isIntegerString('5')).toBe(true);
    expect(isIntegerString('-5')).toBe(false);
    expect(isIntegerString('05')).toBe(false);
    expect(isIntegerString('0.5')).toBe(false);
    expect(isIntegerString('005')).toBe(false);
    expect(isIntegerString('-0')).toBe(false);
    expect(isIntegerString('5.')).toBe(false);
});

test('isString', () => {
    expect(isString('')).toBe(true);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(jest.fn)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(false)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
});

test('isLength', () => {
    expect(isLength(1)).toBe(true);
    expect(isLength(-1)).toBe(false);
    expect(isLength(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(isLength('')).toBe(false);
    expect(isLength({})).toBe(false);
    expect(isLength([])).toBe(false);
    expect(isLength(jest.fn)).toBe(false);
    expect(isLength(true)).toBe(false);
    expect(isLength(false)).toBe(false);
    expect(isLength(null)).toBe(false);
    expect(isLength(undefined)).toBe(false);
});

test('cloneDeep', () => {
    const date = new Date(1637255145795);
    const clone1 = cloneDeep(obj1);
    const clone2 = cloneDeep(date);

    expect(clone1).toEqual(obj1);
    expect(clone1 === obj1).toBe(false);
    expect(clone2 === date).toBe(false);
});

test('cloneDeep prevents from cycling', () => {
    const a: { foo: number; b?: any } = { foo: 1 };
    const b = { bar: 2, a };
    a.b = b;
    let error = null;

    try {
        cloneDeep(a);
    } catch (e: any) {
        error = e.message as string;
    }

    expect(error).toBe(
        `${PACKAGE_NAME}: circular dependency detected under the path 'b.a:<Circular>' of object you're trying to persist: ${a}`,
    );
});

test('path', () => {
    const value1 = path(obj1, ['a', 'b', 'c', 'd']);
    const value2 = path(obj1, ['a', 'b', 'c', 'd', 'f', '1']);
    const subset = {
        e: 'some value',
        f: [0, 1, 2],
    };
    expect(value1).toEqual(subset);
    expect(value2).toEqual(1);
});

test('assocPath', () => {
    const value1 = assocPath(['a', 'b', 'c', 'd'], 'some value');
    const value2 = assocPath(['a', 'b', 'c', 'd', 'f', '3'], 'some value');
    const value3 = assocPath(['a', '1', 'c', '2', '0'], 'some value');

    const expected1 = {
        a: { b: { c: { d: 'some value' } } },
    };

    const expected2 = {
        a: { b: { c: { d: { f: [undefined, undefined, undefined, 'some value'] } } } },
    };

    const expected3 = {
        a: [undefined, { c: [undefined, undefined, ['some value']] }],
    };

    expect(value1).toEqual(expected1);
    expect(value2).toEqual(expected2);
    expect(value3).toEqual(expected3);
});

test('mergeDeep', () => {
    const merged1 = mergeDeep(obj1, obj2);
    const merged2 = mergeDeep(array1, array2);
    const merged3 = mergeDeep(array1, array3);
    const merged4 = mergeDeep(array1, array3, { preservePlaceholder: true });
    const merged5 = mergeDeep(array1, array2, { preserveUndefined: true });

    const expected1 = {
        a: {
            b: {
                c: {
                    d: {
                        e: 'new value',
                        f: [0, 'some value', 2],
                    },
                },
            },
        },
        h: 'some string 1',
        g: 'some string 2',
    };

    const expected2 = ['value 1', null, 'value 4'];
    const expected3 = [null, undefined, 'value 5'];
    const expected4 = [null, PLACEHOLDER_UNDEFINED, 'value 5'];
    const expected5 = [undefined, null, 'value 4'];

    expect(merged1).toEqual(expected1);
    expect(merged2).toEqual(expected2);
    expect(merged3).toEqual(expected3);
    expect(merged4).toEqual(expected4);
    expect(merged5).toEqual(expected5);
});

test('dissocPath', () => {
    const value = dissocPath(obj1, ['a', 'b', 'c', 'd', 'f']);
    const value2 = dissocPath(value, ['h']);
    const value3 = dissocPath(array1, ['1']);

    const expected1 = {
        a: { b: { c: { d: { e: 'some value' } } } },
    };
    const expected2 = ['value 1', undefined, 'value 3'];

    expect(value2).toEqual(expected1);
    expect(value3).toEqual(expected2);
});

test('preserveUndefined', () => {
    const value1 = preserveUndefined(array4, ['0'], ConfigType.WHITELIST);
    const value2 = preserveUndefined(array4, ['1'], ConfigType.WHITELIST);
    const value3 = preserveUndefined(array4, ['0'], ConfigType.BLACKLIST);
    const value4 = preserveUndefined(array4, ['1'], ConfigType.BLACKLIST);
    const value5 = preserveUndefined(array5, ['0.0', '1.2', '2.1'], ConfigType.WHITELIST);
    const value6 = preserveUndefined(array5, ['0.2', '1.0', '2.2'], ConfigType.WHITELIST);
    const value7 = preserveUndefined(array5, ['0.0', '1.2', '2.1'], ConfigType.BLACKLIST);
    const value8 = preserveUndefined(array5, ['0.2', '1.0', '2.2'], ConfigType.BLACKLIST);
    const value9 = preserveUndefined(array6, [], ConfigType.BLACKLIST, true);
    const value10 = preserveUndefined(array6, ['0', '2.2.0'], ConfigType.BLACKLIST, true);

    // replaces null with undefined at every place NOT mentioned in pathsArray
    const expected1 = [null, undefined, undefined];
    const expected2 = [undefined, null, undefined];
    const expected5 = [
        [null, undefined, undefined],
        [undefined, undefined, null],
        [undefined, null, undefined],
    ];
    const expected6 = [
        [undefined, undefined, null],
        [null, undefined, undefined],
        [undefined, undefined, null],
    ];

    // replaces null with undefined at every place mentioned in pathsArray
    const expected3 = [undefined, null, null];
    const expected4 = [null, undefined, null];
    const expected7 = [
        [undefined, null, null],
        [null, null, undefined],
        [null, undefined, null],
    ];
    const expected8 = [
        [null, null, undefined],
        [undefined, null, null],
        [null, null, undefined],
    ];

    // preserve @@placeholder/undefined at every place NOT mentioned in pathsArray
    const expected9 = [
        PLACEHOLDER_UNDEFINED,
        [PLACEHOLDER_UNDEFINED, null, 'value 1'],
        [PLACEHOLDER_UNDEFINED, null, [PLACEHOLDER_UNDEFINED, 'value 2']],
    ];

    const expected10 = [
        undefined,
        [PLACEHOLDER_UNDEFINED, null, 'value 1'],
        [PLACEHOLDER_UNDEFINED, null, [undefined, 'value 2']],
    ];

    expect(value1).toEqual(expected1);
    expect(value2).toEqual(expected2);
    expect(value5).toEqual(expected5);
    expect(value6).toEqual(expected6);

    expect(value3).toEqual(expected3);
    expect(value4).toEqual(expected4);
    expect(value7).toEqual(expected7);
    expect(value8).toEqual(expected8);

    expect(value9).toEqual(expected9);
    expect(value10).toEqual(expected10);
});

test('singleTransformValidator', () => {
    let error1 = '';
    let error2 = '';
    let error3 = '';

    try {
        singleTransformValidator(undefined, '', ConfigType.WHITELIST);
    } catch (e: any) {
        error1 = e.message as string;
    }

    try {
        singleTransformValidator(['a', 'b', 'c', 'a'], 'key', ConfigType.WHITELIST);
    } catch (e: any) {
        error2 = e.message as string;
    }

    try {
        singleTransformValidator(['a.b', 'a.b.c', 'a.d.1'], 'key', ConfigType.WHITELIST);
    } catch (e: any) {
        error3 = e.message as string;
    }

    expect(error1.indexOf('Name (key) of reducer is required') !== -1).toBe(true);
    expect(error2.indexOf('Duplicated paths') !== -1).toBe(true);
    expect(error2.indexOf('["a","a"]') !== -1).toBe(true);
    expect(error3.indexOf('You are trying to persist an entire property') !== -1).toBe(true);
    expect(error3.indexOf('["a.b","a.b.c"]') !== -1).toBe(true);
});

test('difference', () => {
    const value = difference(obj1, obj2);
    const expected = {
        g: 'some string 2',
        h: undefined,
        a: {
            b: {
                c: {
                    d: {
                        e: 'new value',
                        f: {
                            1: 'some value',
                        },
                    },
                },
            },
        },
    };

    expect(value).toEqual(expected);
});

test('isEmpty', () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: true })).toBe(false);
});

test('isDate', () => {
    const date = new Date();
    expect(isDate(date)).toBe(true);
    expect(isDate('Thu Nov 18 2021 18:12:20 GMT+0100')).toBe(false);
});

test('getCircularPath', () => {
    const a: any = { foo: 1 };
    const b = { bar: 1, a };
    a.b = b;
    const path = getCircularPath(a);
    expect(path).toEqual('b.a:<Circular>');
});

test('findDuplicatesAndSubsets', () => {
    const paths = ['b', 'a', 'a.a2', 'f', 'g.1', 'b.b2.b3', 'g.1.2', 'b', 'c.c2', 'c.c2.c3', 'd.d2.d3', 'e'];
    const value = findDuplicatesAndSubsets(paths);
    const expected = {
        duplicates: ['b', 'b'],
        subsets: ['a', 'a.a2', 'b', 'b.b2.b3', 'c.c2', 'c.c2.c3', 'g.1', 'g.1.2'],
    };
    expect(value).toEqual(expected);
});

test('unique', () => {
    const array = ['a', 'a', 'b', 'c', 'd', 'a', 'c', 'd', 'e'];
    const value = array.filter(unique);
    const expected = ['a', 'b', 'c', 'd', 'e'];
    expect(value).toEqual(expected);
});

test('transformsValidator', () => {
    let error = '';
    const transforms = [
        { deepPersistKey: 'a' },
        { deepPersistKey: 'b' },
        { deepPersistKey: 'c' },
        { deepPersistKey: 'b' },
        { deepPersistKey: 'd' },
        { deepPersistKey: 'e' },
        { deepPersistKey: 'd' },
        { deepPersistKey: 'f' },
    ];
    try {
        transformsValidator(transforms);
    } catch (e: any) {
        error = e.message as string;
    }

    expect(error.indexOf('redux-deep-persist: found duplicated key') !== -1).toBe(true);
    expect(error.indexOf('Duplicates: ["b","d"]') !== -1).toBe(true);
});
