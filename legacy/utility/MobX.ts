import { toJS } from 'mobx';

export function getMobxData<T extends Record<string, any>>(observable: any): T {
    for (const key of Object.getOwnPropertySymbols(observable)) {
        const store = observable[key]?.values;

        if (store instanceof Map)
            return Object.fromEntries(
                Array.from(store, ([key, { value }]) => [key, toJS(value)])
            );
    }
}
