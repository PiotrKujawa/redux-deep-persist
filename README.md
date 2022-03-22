# About this package

It contains transforms and state reconciler for [Redux Persist](https://www.npmjs.com/package/redux-persist) giving you a possibility
to define a nested configuration for your redux-persist.

If your redux state is deeply nested you don't have to create multiple, nested persist configs. You can easily create a whitelist or a blacklist for fields at any level of your state, using simple dot notation```[someProp.secondLevel.thirdLevel.anotherLevel]```

The state should be as flat as possible but sometimes is not
and in that case, this will be very helpful.

This package uses transforms along with autoMergeDeep reconciler function and also
getPersistConfig helper method to let you easily create a redux-persist config.

## Installation

npm install redux-deep-persist

## Usage

Configuration is similar to the [Redux Persist](https://github.com/rt2zz/redux-persist#basic-usage), the only difference is you don't have to define nested persist configs. You can use _getPersistConfig_ which will return the correct configuration you need.

It doesn't matter how deep you want to persist your state.

### Example

#### State:
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
    user: {
        name: 'John Smith',
        age: 30,
        address: {
            country: 'some value'
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

#### Configuration using _getPersistConfig_ (recommended):

```
const config = getPersistConfig({
    key: 'root',
    storage: LocalStorage, // whatever storage you use
    whitelist: [
        'app.property1.nestedProperty2',
        'app.property2.another1.another3',
        'app.property2.somethingElse',
        'user', // include entire user
        'coordinates.0.someProperty' // we'll persist 'someProperty' of the object placed at the first index of that array
    ],
    rootReducer, // your root reducer must be also passed here
    ... // any other props from original redux-persist config omitting state reconciler
})
```

This method uses autoMergeDeep state reconciler internally. You don't have to pass it. In the example above, the "settings" property will be not included.

#### Configuration using transforms and state reconciler (not recommended):


```
import { createWhitelist, createBlacklist autoMergeDeep } from 'redux-deep-persist';

// original redux-persist config with deep persist transforms and state reconciler
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
        createWhitelist('user'), // include entire user
        createWhitelist('coordinates', [
            '0.someProperty' // we'll persist 'someProperty' of the object placed at the first index of that array
        ]),
    ],
    stateReconciler: autoMergeDeep, 
};
```

The first argument of _createWhitelist_ and _createBlacklist_ functions is a key of your root state. You can create only one transform per key. Duplicates are not allowed.
Be aware that every transform works only for one root reducer key and in redux-persist everything is persisted on default. That means if you want to whitelist something specific you will have to blacklist all the other things using _createBlacklist_. That's why _getPersistConfig_ is the more preferred method that will do everything for you.

***Available transforms***
``` 
// To create nested whitelist
createWhitelist(key: string, paths?: string[]);

// To create nested blacklist
createBlacklist(key: string, paths?: string[]);
```

## Note
You may already realize that this package supports arrays. You can define at what index you would like to keep a value. This would be an extremely rare situation if you would need this but with this package, it is possible to handle it.

```
{
    ...
    whitelist: ['rootReducerKey.someProperty.4.anotherProp.8.5'] // the numbers represent indexes of arrays
}
```

OR

``` 
createWhitelist('rootReducerKey', [
    'someProperty.4.anotherProp.8.5'
])
```

### Errors and their meaning
The package has config validators and if your config is wrong
you may see the following errors:

***For wrong configuration using getPersistConfig***

* **"Whitelisted root keys also found in the blacklist."**
    - _it occurs when you try to use whitelist and blacklist at once, you should choose just one approach_

* **"Duplicates of paths found in your whitelist/blacklist"**
    - _you defined duplicated paths in your whitelist or blacklist arrays. Wrong: ```["user", "app.property1", "user"]```._

* **"Subsets of some parent keys found in your whitelist/blacklist. You must decide if you want to persist an entire path or its specific subset."**
    - _i.e. if you want to persist the entire "user" property you can't list its subsets in the config. Wrong: ```["user", "user.name"]```_
---
***For wrong configuration using transforms***

* **"Name (key) of reducer is required. Check your createWhitelist/createBlacklist arguments"**
    - _it occurs when you forget to pass a key of your root state - the first argument of createWhitelist or createBlacklist methods_
* **"Duplicated paths. Check your createWhitelist/createBlacklist arguments"**
    - _it occurs when you defined duplicated paths of your root state subsets in createWhitelist or createBlacklist_
* **"You are trying to persist an entire property and also some of its subset"**
    - _it occurs when you define a property path for entire property persistance and also its subset path in createWhitelist or createBlacklist_
* **"Found duplicated keys in transforms creators. You can createWhitelist or createBlacklist for a specific root reducer key only once. Duplicated keys among createWhitelist and createBlacklist transforms are not allowed"**
    - _it occurs when you createWhitelist or createBlacklist multiple times for the same root state key_

### Demo page
[Redux Deep Persist Demo](https://dev835.d86k7pvhbipq8.amplifyapp.com/)

### Examples repository
- coming soon

### License
[MIT](https://opensource.org/licenses/MIT)





