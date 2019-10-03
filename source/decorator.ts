import { Reflect, PlainObject } from './utility';

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
