# Redux Deep Persist 

[![npm version](https://img.shields.io/npm/v/redux-deep-persist?style=flat-square)](https://img.shields.io/npm/v/redux-deep-persist) [![build status](https://img.shields.io/github/actions/workflow/status/PiotrKujawa/redux-deep-persist/build.yml?branch=master)](https://img.shields.io/github/actions/workflow/status/PiotrKujawa/redux-deep-persist/build.yml?branch=master) [![npm downloads](https://img.shields.io/npm/dw/redux-deep-persist?style=flat-square)](https://img.shields.io/npm/dw/redux-deep-persist) [![license](https://img.shields.io/github/license/PiotrKujawa/redux-deep-persist?style=flat-square)](https://img.shields.io/github/license/PiotrKujawa/redux-deep-persist)

<a href="https://rdp-demo.net" target="_blank">Demo Page</a>

## About this package

Redux Deep Perist contains transforms and state reconciler for [Redux Persist](https://www.npmjs.com/package/redux-persist) giving you a possibility to define a nested configuration for your redux-persist.

If your redux state is deeply nested you don't have to create multiple, nested persist configs. You can easily create a whitelist or a blacklist for fields at any level of your state, using simple dot notation `['someProp.secondLevel.thirdLevel.anotherLevel']`

Redux documentation recommends to keep the state as flat as possible, but it is not always possible. Redux Deep Persist may be very helpful in a situation when deep nesting is hard to avoid.

## Installation

npm install redux-deep-persist

## Usage

Configuration is similar to the [Redux Persist](https://github.com/rt2zz/redux-persist#basic-usage), the only difference is you don't have to define nested persist configs. You can use _getPersistConfig_ which will return the correct configuration you need.

It doesn't matter how deep you want to persist your state.

### Example

#### State:
```js
{
    property1: {
        a1: {
            b1: {
                c1: 'some value'
            }
        },
        a2: {
            b2: {
                c2: 'some value',
                d2: 'some value'
            }
        }
    },
    property2: {
        a1: {
            b1: {
                c1: {
                    d1: 'some value'
                }
            }
        }
        a2: 'some value'
    },
}
```

#### Configuration

```js
import { getPersistConfig } from 'redux-deep-persist';

const config = getPersistConfig({
    key: 'root',
    storage: LocalStorage, // whatever storage you use
    whitelist: [
        'property1.a1.b1',  
        'property1.a2.b2.c2',  
        'property2.a2',
    ],
    rootReducer, // your root reducer must be also passed here
    ... // any other props from original redux-persist config omitting the state reconciler
})
```

Whitelist configuration property contains paths that define pieces of your state to be kept in your storage.

#### Use cases
* Once you define a whitelist any path which is not listed in that property won't be persisted
* If you don't define a whitelist then your entire store will be persisted. To exclude some pieces of your state from storage you must define a _blacklist_ with specific paths of your choice.
* This package supports arrays. You can define at what index you would like to keep or exclude a value. This would be an extremely rare situation if you would need this but anyway it's possible to handle it.

```js
{
    ...
    whitelist: ['a.b.4.c.8.5'] // the numbers represent indexes of arrays
}
```
* You can keep arrays with undefined and null values even if your store will be stringified. It's also a very rare case but undefined values of an array won't be replaced with null and after rehydration, you will get all null and undefined values as you would expect.

### Errors and their meaning
The package has config validators and if your config is wrong you may see the following errors:

* **"You should not define a whitelist and blacklist in parallel."**
    - _it occurs when you try to use whitelist and blacklist at once, you should choose just one approach_

* **"Duplicates of paths found in your whitelist/blacklist."**
    - _you defined duplicated paths in your whitelist or blacklist arrays. Wrong: ```["property1", "property2.a2", "property1"]```._

* **"Subsets of some parent keys found in your whitelist/blacklist. You must decide if you want to persist an entire path or its specific subset."**
    - _i.e. if you want to persist the entire "property1" you can't list its subsets in the config. Wrong: ```["property1", "property1.a1"]```_

### Examples repository
- coming soon

### Contributors
 I want to thank <a href="https://github.com/andrzejWilde" target="_blank">Andrzej Wilde</a> and <a href="https://github.com/ddrcode" target="_blank">David de Rosier</a> for all their support and accurate reviews.

### License
[MIT](https://opensource.org/licenses/MIT)





