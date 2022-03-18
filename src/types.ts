/**
 * Types taken from Redux
 */

/**
 * @link https://github.com/reduxjs/redux/blob/master/src/types/actions.ts
 */
export interface AnyAction extends Action {
    [extraProps: string]: any;
}

/**
 * @template T the type of the action's `type` tag.
 * @link https://github.com/reduxjs/redux/blob/master/src/types/actions.ts
 */
export interface Action<T = any> {
    type: T;
}

/**
 * @template S The type of state consumed and produced by this reducer.
 * @template A The type of actions the reducer can potentially respond to.
 * @link https://github.com/reduxjs/redux/blob/master/src/types/reducers.ts
 */
export type Reducer<S = any, A extends Action = AnyAction> = (state: S | undefined, action: A) => S;

/**
 * Types taken from redux-persist
 * @link https://github.com/rt2zz/redux-persist/blob/master/types/types.d.ts
 */

export interface Storage {
    getItem(key: string, ...args: Array<any>): any;
    setItem(key: string, value: any, ...args: Array<any>): any;
    removeItem(key: string, ...args: Array<any>): any;
}

export interface PersistState {
    version: number;
    rehydrated: boolean;
}

export type PersistedState =
    | {
          _persist: PersistState;
      }
    | undefined;

export type PersistMigrate = (state: PersistedState, currentVersion: number) => Promise<PersistedState>;

/**
 * @desc
 * `SS` means SubState
 * `ESS` means EndSubState
 * `S` means State
 */
export type TransformInbound<SS, ESS, S = any> = (subState: SS, key: keyof S, state: S) => ESS;

/**
 * @desc
 * `SS` means SubState
 * `HSS` means HydratedSubState
 * `RS` means RawState
 */
export type TransformOutbound<SS, HSS, RS = any> = (state: SS, key: keyof RS, rawState: RS) => HSS;

export interface Transform<HSS, ESS, S = any, RS = any> {
    in: TransformInbound<HSS, ESS, S>;
    out: TransformOutbound<ESS, HSS, RS>;
    deepPersistKey?: string;
}

export type Transforms<HSS, ESS, S, RS> = Array<Transform<HSS, ESS, S, RS>>;

/**
 * @desc
 * `S` means State
 * `RS` means RawState
 * `HSS` means HydratedSubState
 * `ESS` means EndSubState
 */
export interface PersistConfig<S, RS = any, HSS = any, ESS = any> {
    version?: number;
    storage: Storage;
    key: string;
    /**
     * @deprecated keyPrefix is going to be removed in v6.
     */
    keyPrefix?: string;
    blacklist?: Array<string>;
    whitelist?: Array<string>;
    transforms?: Array<Transform<HSS, ESS, S, RS>>;
    throttle?: number;
    migrate?: PersistMigrate;
    stateReconciler?: false | StateReconciler<S>;
    /**
     * @desc Used for migrations.
     */
    getStoredState?: (config: PersistConfig<S, RS, HSS, ESS>) => Promise<PersistedState>;
    debug?: boolean;
    serialize?: boolean;
    timeout?: number;
    writeFailHandler?: (err: Error) => void;
}

export type StateReconciler<S> = (inboundState: any, state: S, reducedState: S, config: PersistConfig<S>) => S;

/**
 * Types used in redux deep persist core and utils
 */

export type TObject = Record<any, any>;
export type RootKeysGroup = { [key: string]: string[] | undefined };

export enum ConfigType {
    WHITELIST,
    BLACKLIST,
}

export interface GetPersistConfigArgs<S> extends Omit<PersistConfig<S>, 'stateReconciler'> {
    rootReducer: Reducer<S>;
}
