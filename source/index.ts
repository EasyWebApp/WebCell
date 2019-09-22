import 'reflect-metadata';

import createElement from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';
import { PlainObject, fromEntries } from './utility';

const { concat } = Array.prototype;

export * from './utility';
export * from './WebCell';

interface ComponentMeta {
    tagName: string;
    extends?: string;
    style?: string;
}

export function component(meta: ComponentMeta) {
    return (Class: Function) => {
        Reflect.defineMetadata('tagName', meta.tagName, Class);

        if (meta.style) Reflect.defineMetadata('style', meta.style, Class);

        customElements.define(meta.tagName, Class, { extends: meta.extends });
    };
}

export function watch(component: PlainObject, key: string) {
    Object.defineProperty(component, key, {
        set(value) {
            this.commit(key, value);
        },
        get() {
            return this.props[key];
        },
        configurable: true,
        enumerable: true
    });
}

export function attribute({ constructor }: PlainObject, key: string) {
    const list = Reflect.getMetadata('attributes', constructor) || [];

    list.push(key.toLowerCase());

    Reflect.defineMetadata('attributes', list, constructor);
}

export function create(
    tag: string | Function,
    data?: any,
    ...children: (string | VNode)[]
) {
    if (typeof tag !== 'string')
        tag = Reflect.getMetadata('tagName', tag) || tag;

    children = concat.apply([], children);

    if (tag instanceof Function) return tag({ ...data, children });

    var { className, style, ...rest }: any = data || {};

    className =
        typeof className === 'string'
            ? fromEntries(className.split(/\s+/).map(name => [name, true]))
            : null;

    const [props, dataset, on] = Object.entries(rest).reduce(
        (objects, [key, value]) => {
            const data = /^data-(.+)/.exec(key);

            if (data)
                objects[1][
                    data[1].replace(/-\w/g, char => char[1].toUpperCase())
                ] = value;
            else if (/^on\w+/.test(key))
                objects[2][key.slice(2).toLowerCase()] = value;
            else objects[0][key] = value;

            return objects;
        },
        [{}, {}, {}] as PlainObject[]
    );

    return createElement(
        tag,
        { props, dataset, class: className, style, on },
        children
    );
}
