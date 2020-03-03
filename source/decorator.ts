import { CSSObject, Reflect, stringifyCSS, toHyphenCase } from './utility';
import { WebCellComponent } from './WebCell';

interface ComponentMeta {
    tagName: string;
    extends?: string;
    renderTarget?: 'shadowRoot' | 'children';
    style?: string | CSSObject;
}

export function component(meta: ComponentMeta) {
    return (Class: { new (): HTMLElement }) => {
        Reflect.defineMetadata('tagName', meta.tagName, Class);
        Reflect.defineMetadata(
            'renderTarget',
            meta.renderTarget || 'shadowRoot',
            Class
        );

        if (meta.style)
            Reflect.defineMetadata(
                'style',
                typeof meta.style === 'object'
                    ? stringifyCSS(meta.style)
                    : meta.style,
                Class
            );

        customElements.define(meta.tagName, Class, { extends: meta.extends });
    };
}

export function watch(
    prototype: Object,
    key: string,
    meta?: PropertyDescriptor
) {
    const accessor = !!meta;
    meta = meta || Object.getOwnPropertyDescriptor(prototype, key) || {};

    meta.set =
        meta.set ||
        function(this: WebCellComponent, value) {
            this.setProps({ [key]: value });
        };
    meta.get =
        meta.get ||
        function() {
            return this.props[key];
        };
    (meta.configurable = true), (meta.enumerable = true);

    if (!accessor) Object.defineProperty(prototype, key, meta);
}

export function attribute({ constructor }: Object, key: string) {
    const list = Reflect.getMetadata('attributes', constructor) || [];

    list.push(toHyphenCase(key));

    Reflect.defineMetadata('attributes', list, constructor);
}

export interface DOMEventDelegateHandler {
    type: string;
    selector: string;
    method: string;
}

export function on(type: string, selector: string) {
    return (prototype: Object, method: string) => {
        const events: DOMEventDelegateHandler[] =
            Reflect.getMetadata('DOM-Event', prototype) || [];

        events.push({ type, selector, method });

        Reflect.defineMetadata('DOM-Event', events, prototype);
    };
}
