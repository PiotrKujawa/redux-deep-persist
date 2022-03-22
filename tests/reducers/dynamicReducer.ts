import stateConfig from './config';
import { SET_STATE } from '../constants';

type Action = {
    type: string;
    payload?: any;
};

const reducers = stateConfig.reduce<{ [key: string]: (state: any, action: Action) => any }>(
    (acc, curr: any, index: number) => {
        const { initial, modified } = curr;

        acc['example' + index] = function (state = initial, action: Action) {
            switch (action.type) {
                case SET_STATE: {
                    return modified;
                }
                default:
                    return state;
            }
        };
        return acc;
    },
    {},
);

export default reducers;
