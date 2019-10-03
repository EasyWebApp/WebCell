import { Reflect } from './utility';

interface ComponentMeta {
    tagName: string;
    extends?: string;
    renderTarget?: 'shadowRoot' | 'children';
    style?: string;
}

export function component(meta: ComponentMeta) {
    return (Class: Function) => {
        Reflect.defineMetadata('tagName', meta.tagName, Class);
        Reflect.defineMetadata(
            'renderTarget',
            meta.renderTarget || 'shadowRoot',
            Class
        );

        if (meta.style) Reflect.defineMetadata('style', meta.style, Class);

        customElements.define(meta.tagName, Class, { extends: meta.extends });
    };
}

export function watch(prototype: Object, key: string) {
    Object.defineProperty(prototype, key, {
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

export function attribute({ constructor }: Object, key: string) {
    const list = Reflect.getMetadata('attributes', constructor) || [];

    list.push(key.toLowerCase());

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
