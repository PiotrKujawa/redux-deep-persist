export type TObject = Record<any, any>;
export type RootKeysGroup = { [key: string]: string[] | undefined };

export enum ConfigType {
    WHITELIST,
    BLACKLIST,
}
