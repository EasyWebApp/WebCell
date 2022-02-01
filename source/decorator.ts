import {
    CSSObject,
    stringifyCSS,
    toHyphenCase,
    DelegateEventHandler
} from './utility';
import { WebCellClass, WebCellComponent } from './WebCell';

export interface ComponentMeta {
    tagName: `${string}-${string}`;
    extends?: keyof HTMLElementTagNameMap;
    renderTarget?: 'shadowRoot' | 'children';
    style?: string | CSSObject;
}

export function component({ style, ...meta }: ComponentMeta) {
    return <T extends WebCellClass>(Class: T) => {
        customElements.define(
            meta.tagName,
            Object.assign(Class, {
                style: typeof style === 'object' ? stringifyCSS(style) : style,
                ...meta
            }),
            { extends: meta.extends }
        );

        return Class;
    };
}

export function watch(
    prototype: Object,
    key: string,
    meta?: PropertyDescriptor
) {
    const accessor = !!(meta?.get || meta?.set);
    meta = meta || Object.getOwnPropertyDescriptor(prototype, key) || {};

    meta.set =
        meta.set ||
        function (this: WebCellComponent, value) {
            this.setProps({ [key]: value });
        };
    meta.get =
        meta.get ||
        function () {
            return this.props[key];
        };
    (meta.configurable = true), (meta.enumerable = true);

    if (!accessor) Object.defineProperty(prototype, key, meta);
}

export function attribute({ constructor }: Object, key: string) {
    (constructor as WebCellClass).attributes.push(toHyphenCase(key));
}

export interface DOMEventDelegater {
    type: keyof HTMLElementEventMap;
    selector: string;
    method: string;
}

export function on(type: DOMEventDelegater['type'], selector: string) {
    return <T extends DelegateEventHandler>(
        { constructor }: Object,
        method: string,
        meta: PropertyDescriptor
    ) => {
        (constructor as WebCellClass).eventDelegaters.push({
            type,
            selector,
            method
        });
        return meta as PropertyDescriptor & { value: T };
    };
}
