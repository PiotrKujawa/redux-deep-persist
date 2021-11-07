# About this package

If your redux state is deeply nested you don't have to create nested persist configs. You can easily create a whitelist or blacklist for fields at any level of your state. 

The state should be as flat as possible but sometimes is not
and in that case, this will be very helpful.

This package uses transforms along with autoMergeDeep function.

**Available transforms**
``` 
// To create nested whitelist
createWhitelist(key: string, paths?: string[]);

// To create nested blacklist
createBlacklist(key: string, paths?: string[]);
```

## Installation

npm install redux-deep-persist

## Usage

Configuration is similar to the [redux-persist](https://github.com/rt2zz/redux-persist#basic-usage), the only difference is you don't have to define nested persist configs. You can use _transforms_ together with _autoMergeDeep_ state reconciler.

It doesn't matter how deep you want to persist your state.

### Example

#### Example state:
``` 
{
    app: {
        property1: {
            nestedProperty1: 'some value',
            nestedProperty2: 'some value',
            nestedProperty3: 'some value',
        },
        property2: {
            another1: {
                another2: 'some value'
                another3: 'some value'
            },
            somethingElse: 'some value'
        }
    },
    settings: {
        property1: {
            property2: 'some value'
        }
    },
    // yes, it supports arrays
    coordinates: [
        {
            name: 'some name',
            values: {
                x: 'some value',
                y: 'some value'
            }
        }
    ]
}
```

#### Example configuration:

The first argument of createWhitelist/Blacklist functions is a key of your root state. You can create only one transform per key. Duplicates are not allowed.

```
import { createWhitelist, createBlacklist autoMergeDeep } from 'redux-deep-persist';

 const persistConfig = {
    key: 'root',
    storage: AsyncStorage, // whatever storage you use
    transforms: [
        createWhitelist('app', [
            'property1.nestedProperty2',
            'property2.another1.another3',
            'property2.somethingElse'
        ]),
        createBlacklist('settings'), // exclude entire settings 
        createWhitelist('coordinates', [
            '0.someProperty' // we'll persist 'someProperty' of the object placed at the first index of that array
        ]),
    ],
    stateReconciler: autoMergeDeep, 
};
```

## Note
You may already realize that this package supports arrays. You can define at what index you would like to keep a value. This would be an extremely rare situation if you would need this but with this package, it is possible to handle it.

``` 
createWhitelist('rootReducerKey', [
    'someProperty.4.anotherProp.8.5' // the numbers represent indexes of arrays
])
```

### Errors and their meaning
The package has config validators and if your config is wrong
you may see the following errors:

* **"Name (key) of reducer is required. Check your createWhitelist/createBlacklist arguments"**
    - _it occurs when you forget to pass a key of your root state - the first argument of createWhitelist or createBlacklist methods_
* **"Duplicated paths. Check your createWhitelist/createBlacklist arguments"**
    - _it occurs when you defined duplicated paths of your root state subsets in createWhitelist or createBlacklist_
* **"You are trying to persist an entire property and also some of its subset"**
    - _it occurs when you define a property path for entire property persistance and also its subset path in createWhitelist or createBlacklist_
* **"Found duplicated keys in transforms creators. You can createWhitelist or createBlacklist for a specific root reducer key only once. Duplicated keys among createWhitelist and createBlacklist transforms are not allowed"**
    - _it occurs when you createWhitelist or createBlacklist multiple times for the same root state key_

### Demo page (temporary address)
https://rdp-2k9ld0sj29sm.herokuapp.com/

### License
[MIT](https://opensource.org/licenses/MIT)





