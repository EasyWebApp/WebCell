import { DataObject } from 'dom-renderer';
import { ObservableValue } from 'mobx/dist/internal';

export function getMobxData<T extends DataObject>(observable: T) {
    for (const key of Object.getOwnPropertySymbols(observable)) {
        const store = observable[key as keyof T]?.values_ as Map<
            string,
            ObservableValue<T>
        >;
        if (store instanceof Map)
            return Object.fromEntries(
                Array.from(store, ([key, { value_ }]) => [key, value_])
            ) as T;
    }
}
