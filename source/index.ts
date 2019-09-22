import 'reflect-metadata';

import createElement from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';
import { fromEntries, PlainObject } from './utility';

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

export function watch(component: HTMLElement, key: string) {
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

export function attribute({ constructor }: HTMLElement, key: string) {
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

    if (tag instanceof Function) return tag({ ...data, children });

    var { class: className, style, ...rest }: any = data || {};

    className =
        typeof className === 'string'
            ? fromEntries(className.split(/\s+/).map(name => [name, true]))
            : null;

    const [props, on] = Object.entries(rest).reduce(
        (objects, [key, value]) => {
            if (/^on\w+/.test(key)) objects[1][key.slice(2)] = value;
            else objects[0][key] = value;

            return objects;
        },
        [{}, {}] as PlainObject[]
    );

    return createElement(tag, { props, class: className, style, on }, children);
}
