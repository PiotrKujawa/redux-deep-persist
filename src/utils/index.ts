import { PACKAGE_NAME, PLACEHOLDER_UNDEFINED } from '../constants';
import { TObject, ConfigType } from '../types';

export const isObjectLike = function (value: any) {
    return typeof value === 'object' && value !== null;
};

export const isLength = function (value: any) {
    return typeof value === 'number' && value > -1 && value % 1 == 0 && value <= Number.MAX_SAFE_INTEGER;
};

export const isArray =
    Array.isArray ||
    function (value: any) {
        return (
            isLength(value && value.length) &&
            value.length >= 0 &&
            Object.prototype.toString.call(value) === '[object Array]'
        );
    };

export const isPlainObject = function (item: any) {
    return !!item && typeof item === 'object' && !isArray(item);
};

export const isIntegerString = function (x: any) {
    return String(~~x) === x && Number(x) >= 0;
};

export const isString = function (x: any) {
    return Object.prototype.toString.call(x) === '[object String]';
};

export const isDate = function (x: any) {
    return Object.prototype.toString.call(x) === '[object Date]';
};

export const isEmpty = function (obj: TObject) {
    return Object.keys(obj).length === 0;
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

export const getCircularPath = function (obj: TObject, path?: string, seen?: Set<any>): string | null {
    seen || (seen = new Set([obj]));
    path || (path = '');

    for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        if (isObjectLike(value)) {
            if (seen.has(value)) {
                return `${path}.${key}:<Circular>`;
            } else {
                seen.add(value);
                return getCircularPath(value, currentPath, seen);
            }
        }
    }

    return null;
};

export const _cloneDeep = function (obj: TObject) {
    if (!isObjectLike(obj)) {
        return obj;
    }

    if (isDate(obj)) {
        return new Date(+obj);
    }

    const newObj: TObject = isArray(obj) ? [] : {};
    for (const key in obj) {
        const value = obj[key];
        newObj[key] = _cloneDeep(value);
    }
    return newObj;
};

export const cloneDeep = function (obj: TObject) {
    const path = getCircularPath(obj);
    if (path) {
        throw new Error(
            `${PACKAGE_NAME}: circular dependency detected under the path '${path}' of object you're trying to persist: ${obj}`,
        );
    }
    return _cloneDeep(obj);
};

export const difference = function (base: any, newValue: any): TObject {
    if (base === newValue) {
        return {};
    }

    if (!isObjectLike(base) || !isObjectLike(newValue)) {
        return newValue;
    }

    const l = cloneDeep(base);
    const r = cloneDeep(newValue);

    // deleted values
    const deletedValues = Object.keys(l).reduce((acc: TObject, key) => {
        if (hasOwnProperty.call(r, key)) {
            return acc;
        }
        acc[key] = undefined;
        return acc;
    }, {});

    // date values
    if (isDate(l) || isDate(r)) {
        if (l.valueOf() === r.valueOf()) {
            return {};
        }
        return r;
    }

    // added values
    const result: TObject = Object.keys(r).reduce((acc: TObject, key) => {
        if (!hasOwnProperty.call(l, key)) {
            acc[key] = r[key];
            return acc;
        }

        const diff = difference(l[key], r[key]);

        if (isObjectLike(diff) && isEmpty(diff) && !isDate(diff)) {
            // if r or l are array vs plainObject we need to return a new value
            if ((isArray(l) && !isArray(r)) || (!isArray(l) && isArray(r))) {
                return r;
            }
            return acc; // no difference
        }

        acc[key] = diff; // new value
        return acc;
    }, deletedValues);

    delete result._persist;
    return result;
};

export const path = function (obj: TObject, pathArray: string[]) {
    return pathArray.reduce((acc, curr) => {
        if (acc) {
            const parsedCurr = parseInt(curr, 10);
            const index = isIntegerString(curr) && parsedCurr < 0 ? acc.length + parsedCurr : curr;
            return isString(acc) ? acc.charAt(index) : acc[index];
        }
    }, obj);
};

export const assocPath = function (path: string[], value: any) {
    const pathArray = [...path].reverse();
    const result = pathArray.reduce((acc: TObject, curr: string, index: number) => {
        const placeholder: TObject = isIntegerString(curr) ? [] : {};
        placeholder[curr] = index === 0 ? value : acc;
        return placeholder;
    }, {});
    return result;
};

export const dissocPath = function (obj: TObject, pathArray: string[]) {
    const clone = cloneDeep(obj);
    pathArray.reduce((acc, curr, index) => {
        if (index === pathArray.length - 1 && acc) {
            if (isObjectLike(acc)) {
                delete acc[curr];
            }
        }
        return acc && acc[curr];
    }, clone);
    return clone;
};

const _mergeDeep = function (
    options: {
        preservePlaceholder?: boolean;
        preserveUndefined?: boolean;
    },
    target: TObject,
    ...sources: TObject[]
): TObject {
    if (!sources || !sources.length) {
        return target;
    }
    const source = sources.shift();
    const { preservePlaceholder, preserveUndefined } = options;

    if (isObjectLike(target) && isObjectLike(source)) {
        for (const key in source) {
            if (isObjectLike(source[key]) && isObjectLike(target[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                _mergeDeep(options, target[key], source[key]);
            } else {
                if (isArray(target)) {
                    // If !preserveUndefined then undefined will not overwrite the initial state of an array but null or anything else will do
                    // @@placeholder/undefined will be replaced with undefined if preservePlaceholder is false
                    let sourceValue = source[key];
                    const placeholder = preservePlaceholder ? PLACEHOLDER_UNDEFINED : undefined;

                    if (!preserveUndefined) {
                        sourceValue = typeof sourceValue !== 'undefined' ? sourceValue : target[parseInt(key, 10)];
                    }

                    sourceValue = sourceValue !== PLACEHOLDER_UNDEFINED ? sourceValue : placeholder;
                    target[parseInt(key, 10)] = sourceValue;
                } else {
                    const value = source[key] !== PLACEHOLDER_UNDEFINED ? source[key] : undefined;
                    target[key] = value;
                }
            }
        }
    }
    return _mergeDeep(options, target, ...sources);
};

export const mergeDeep = function (
    target: TObject,
    source: TObject,
    options?: {
        preservePlaceholder?: boolean;
        preserveUndefined?: boolean;
    },
) {
    return _mergeDeep(
        {
            preservePlaceholder: options?.preservePlaceholder,
            preserveUndefined: options?.preserveUndefined,
        },
        cloneDeep(target),
        cloneDeep(source),
    );
};

/**
 * It's not possible to keep an undefined array value in storage because it is stringified.
 * Any undefined array value will be converted to null.
 * If some nullish values will come back from storage, this method is to distinguish if it was meant to
 * be persisted based on the persist configuration.
 * EXAMPLE: if we want to persist only second index of an array, we will send [undefined, undefined, 'something']
 * to storage but stringified value will be [null, null, 'something'].
 * When such array will come back from storage, how could we know these nullish values wren't intended
 * to be persisted, we could either set them intentionally.
 * In such case we wouldn't know if a "null" which came back from a storage should overwrite currently reduced value or not.
 * That's why we change it to undefined if it wasn't meant to be persisted or we'll keep it as a null if we want it.
 * The function mergeDeep will overwrite reduced state with a null but will keep it as it is if an undefined will come.
 * The only way to keep real undefined values in an array persisted in a storage is to use @@placeholder/undefined value
 * which will be replaced with a real undefined while merging process of reduced state with storage outbound state.
 */
const _preserveUndefined = function (
    obj: TObject,
    pathsArray: string[] = [],
    type: ConfigType,
    prevPath: string,
    preserveAsPlaceholder?: boolean,
) {
    if (!isObjectLike(obj)) {
        return obj;
    }

    for (const key in obj) {
        const value = obj[key];
        const belongsToArray = isArray(obj);
        const pathString = prevPath ? prevPath + '.' + key : key;

        if (
            value === null &&
            ((type === ConfigType.WHITELIST && pathsArray.indexOf(pathString) === -1) ||
                (type === ConfigType.BLACKLIST && pathsArray.indexOf(pathString) !== -1)) &&
            belongsToArray
        ) {
            obj[parseInt(key, 10)] = undefined;
        }

        if (
            value === undefined &&
            preserveAsPlaceholder &&
            type === ConfigType.BLACKLIST &&
            pathsArray.indexOf(pathString) === -1 &&
            belongsToArray
        ) {
            obj[parseInt(key, 10)] = PLACEHOLDER_UNDEFINED;
        }

        _preserveUndefined(value, pathsArray, type, pathString, preserveAsPlaceholder);
    }
};

export const preserveUndefined = function (
    outboundState: TObject,
    pathsArray: string[] | undefined,
    type: ConfigType,
    preserveAsPlaceholder?: boolean,
) {
    const clone = cloneDeep(outboundState);
    _preserveUndefined(clone, pathsArray, type, '', preserveAsPlaceholder);
    return clone;
};

const unique = function (value: string, index: number, self: string[]) {
    return self.indexOf(value) === index;
};

export const configValidator = function (config: string[] | undefined, name: string, type: ConfigType) {
    const typeText = type === ConfigType.WHITELIST ? 'whitelist' : 'blacklist';
    const commonErrorMsg1 = `${PACKAGE_NAME}: incorrect ${typeText} configuration.`;
    const commonErrorMsg2 = `Check your create${type === ConfigType.WHITELIST ? 'White' : 'Black'}list arguments.\n\n`;

    if (!isString(name) || name.length < 1) {
        throw new Error(`${commonErrorMsg1} Name (key) of reducer is required. ${commonErrorMsg2}`);
    }

    if (!config || !config.length) {
        return;
    }

    const entities = config.reduce<{
        duplicates: string[];
        subsets: string[];
    }>(
        (entities, path) => {
            const filteredDuplicates = config.filter((inner) => inner === path);
            const filteredSubsets = config.filter((inner) => {
                return path.indexOf(inner) === 0;
            });

            const { duplicates, subsets } = entities;

            const foundDuplicates = filteredDuplicates.length > 1 && duplicates.indexOf(path) === -1;
            const foundSubsets = filteredSubsets.length > 1;

            return {
                duplicates: [...duplicates, ...(foundDuplicates ? filteredDuplicates : [])],
                subsets: [...subsets, ...(foundSubsets ? filteredSubsets : [])]
                    .filter(unique)
                    .sort((a, b) => a.length - b.length),
            };
        },
        {
            duplicates: [],
            subsets: [],
        },
    );

    const { duplicates, subsets } = entities;

    if (duplicates.length > 1) {
        throw new Error(
            `${commonErrorMsg1} Duplicated paths.\n\n ${JSON.stringify(duplicates)}\n\n ${commonErrorMsg2}`,
        );
    }

    if (subsets.length > 1) {
        throw new Error(
            `${commonErrorMsg1} You are trying to persist an entire property and also some of its subset.\n\n${JSON.stringify(
                subsets,
            )}\n\n ${commonErrorMsg2}`,
        );
    }
};

export const transformsValidator = function (
    transforms: Array<{
        deepPersistKey: string;
    }>,
) {
    const keys = transforms?.map((t) => t.deepPersistKey).filter((k) => k) || [];

    if (keys.length) {
        const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

        if (duplicates.length) {
            throw new Error(
                `${PACKAGE_NAME}: found duplicated keys in transforms creators. You can createWhitelist or createBlacklist for a specific root reducer key only once. Duplicated keys among createWhitelist and createBlacklist transforms are not allowed.\n\n Duplicates: ${JSON.stringify(
                    duplicates,
                )}`,
            );
        }
    }
};
