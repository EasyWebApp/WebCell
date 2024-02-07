import { DataObject } from 'dom-renderer';
import { ObservableValue } from 'mobx/dist/internal';
import { delegate } from 'web-utility';

export class Defer<T = void> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

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

export const animated = <T extends HTMLElement | SVGElement>(
    root: T,
    targetSelector: string
) =>
    new Promise<AnimationEvent>(resolve => {
        const ended = delegate(targetSelector, (event: AnimationEvent) => {
            root.removeEventListener('animationend', ended);
            root.removeEventListener('animationcancel', ended);
            resolve(event);
        });

        root.addEventListener('animationend', ended);
        root.addEventListener('animationcancel', ended);
    });
