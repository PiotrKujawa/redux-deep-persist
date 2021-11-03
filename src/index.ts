import {
    isEmpty,
    isArray,
    isObjectLike,
    isIntegerString,
    difference,
    path,
    assocPath,
    dissocPath,
    cloneDeep,
    mergeDeep,
    preserveUndefined,
    configValidator,
    transformsValidator,
} from './utils';

import { PLACEHOLDER_UNDEFINED, PACKAGE_NAME } from './constants';
import { TObject, ConfigType } from './types';

type TransformConfig = {
    whitelist?: string[];
    blacklist?: string[];
};

// Taken directly from redux-persist to avoid peerDependency
const createTransform = function (inbound: Function, outbound: Function, config: TransformConfig = {}): any {
    const whitelist = config.whitelist || null;
    const blacklist = config.blacklist || null;

    function whitelistBlacklistCheck(key: string) {
        if (whitelist && whitelist.indexOf(key) === -1) return true;
        if (blacklist && blacklist.indexOf(key) !== -1) return true;
        return false;
    }

    return {
        in: (state: Record<string, unknown>, key: string, fullState: Record<string, unknown>) =>
            !whitelistBlacklistCheck(key) && inbound ? inbound(state, key, fullState) : state,
        out: (state: Record<string, unknown>, key: string, fullState: Record<string, unknown>) =>
            !whitelistBlacklistCheck(key) && outbound ? outbound(state, key, fullState) : state,
        deepPersistKey: whitelist && whitelist[0],
    };
};

// Based on redux-persist/lib/stateReconciler/autoMergeLevel2 but with deep merging
export const autoMergeDeep = <S extends TObject>(
    inboundState: S,
    originalState: S,
    reducedState: S,
    {
        debug,
        whitelist,
        blacklist,
        transforms,
    }: {
        debug?: boolean;
        whitelist?: string[];
        blacklist?: string[];
        transforms?: ReturnType<typeof createWhitelist> | ReturnType<typeof createBlacklist>;
    },
): S => {
    if (whitelist || blacklist) {
        throw new Error(
            'State reconciler autoMergeDeep uses custom transforms instead of old whitelist or blacklist config properties. Please use createWhitelist or createBlacklist transforms.',
        );
    }

    // check transforms for duplicates to avoid createWhitelist / blacklist for the same root reducer key more than once
    transformsValidator(transforms);

    const newState = cloneDeep(reducedState);
    let toRehydrateState = inboundState;

    // only rehydrate if inboundState exists and is an object
    if (toRehydrateState && isObjectLike(toRehydrateState)) {
        // if any of sub state was modified by your reducer on redux-persist rehydrate action
        // then modified values has priority over the inbound state coming from storage
        const diff = difference(originalState, reducedState);

        if (!isEmpty(diff)) {
            toRehydrateState = mergeDeep(inboundState, diff, { preserveUndefined: true });
            if (debug) {
                console.log(
                    `${PACKAGE_NAME}/autoMergeDeep: sub state of your state was modified by reducer during rehydration. Values from reducer will be kept: ${JSON.stringify(
                        diff,
                    )}`,
                );
            }
        }

        Object.keys(toRehydrateState).forEach((key) => {
            // ignore _persist data
            if (key === '_persist') {
                return;
            }

            if (isObjectLike(newState[key])) {
                newState[key] = mergeDeep(newState[key], toRehydrateState[key]);
                return;
            }

            // otherwise hard set
            newState[key] = toRehydrateState[key];
        });
    }

    if (debug && toRehydrateState && isObjectLike(toRehydrateState)) {
        console.log(`${PACKAGE_NAME}/autoMergeDeep: rehydrated keys ${JSON.stringify(toRehydrateState)}`);
    }

    return newState;
};

// Transform returns a piece of inboundState based on passed whitelist paths
export const createWhitelist = (key: string, whitelist?: string[]) => {
    configValidator(whitelist, key, ConfigType.WHITELIST);

    return createTransform(
        // transform state on its way to being serialized and persisted.
        (inboundState: TObject) => {
            if (!whitelist || !whitelist.length) {
                return inboundState;
            }

            let inboundToPersist: TObject | null = null;
            let value;

            whitelist.forEach((statePath) => {
                const pathArray = statePath.split('.');
                value = path(inboundState, pathArray);
                if (typeof value === 'undefined' && isIntegerString(pathArray[pathArray.length - 1])) {
                    value = PLACEHOLDER_UNDEFINED;
                }

                const assocResult = assocPath(pathArray, value);
                const initial = isArray(assocResult) ? [] : {};

                inboundToPersist = mergeDeep(!inboundToPersist ? initial : inboundToPersist, assocResult, {
                    preservePlaceholder: true,
                });
            });

            return inboundToPersist || inboundState;
        },
        // transform state being rehydrated
        (outboundState: TObject) => {
            return preserveUndefined(outboundState, whitelist, ConfigType.WHITELIST);
        },
        // define which reducers this transform gets called for
        {
            whitelist: [key],
        },
    );
};

// Transform returns a piece of inboundState based on passed blacklist paths
export const createBlacklist = (key: string, blacklist?: string[]) => {
    configValidator(blacklist, key, ConfigType.BLACKLIST);
    return createTransform(
        // transform state on its way to being serialized and persisted.
        (inboundState: TObject) => {
            if (!blacklist || !blacklist.length) {
                return;
            }

            // need to preserve @@placeholder/undefined if undefined value of an array isn't mentioned on the blacklist
            const inboundToPersist = preserveUndefined(inboundState, blacklist, ConfigType.BLACKLIST, true);

            const paths = blacklist.map((statePath) => statePath.split('.'));

            return paths.reduce((inboundToPersist, pathArray) => {
                return dissocPath(inboundToPersist, pathArray);
            }, inboundToPersist);
        },
        // transform state being rehydrated
        (outboundState: TObject) => {
            return preserveUndefined(outboundState, blacklist, ConfigType.BLACKLIST);
        },
        // define which reducers this transform gets called for
        {
            whitelist: [key],
        },
    );
};