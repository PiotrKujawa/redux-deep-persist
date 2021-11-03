import stateConfig from './config';
import { SET_STATE, RESET_STATE } from '../constants';

type Action = {
    type: string;
    payload?: any;
};

const reducers: { [key: string]: any } = {};

stateConfig.forEach(({ initial, modified }, index) => {
    reducers['example' + index] = function (state = initial, action: Action) {
        switch (action.type) {
            case SET_STATE: {
                return modified;
            }
            case RESET_STATE: {
                return initial;
            }
            default:
                return state;
        }
    };
});

export default reducers;
