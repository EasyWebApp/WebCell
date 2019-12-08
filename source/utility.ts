import { VNodeChildElement } from './renderer';

export type PlainObject = { [key: string]: any };

const meta = new WeakMap();

function defineMetadata(key: string, value: any, target: Object) {
    const data = meta.get(target) || {};

    data[key] = value;

    meta.set(target, data);
}

function getMetadata(key: string, target: Object) {
    const data: PlainObject | null = meta.get(target);

    if (data) return data[key];
}

export const Reflect = { defineMetadata, getMetadata };

export function toHyphenCase(raw: string) {
    return raw.replace(/[A-Z]+/g, match => '-' + match.toLowerCase());
}

export function toCamelCase(raw: string) {
    return raw.replace(/-[a-z]/g, match => match[1].toUpperCase());
}

const spawn = document.createElement('template'),
    cache: PlainObject = {};

export function templateOf(tagName: string) {
    if (cache[tagName]) return cache[tagName];

    spawn.innerHTML = `<${tagName} />`;

    return (cache[tagName] = spawn.content.firstElementChild!);
}

export function elementTypeOf(tagName: string) {
    const node = templateOf(tagName);

    return node instanceof HTMLElement && !(node instanceof HTMLUnknownElement)
        ? 'html'
        : 'xml';
}

export function delegate(selector: string, handler: Function) {
    return function(this: Node, event: Event) {
        var node,
            path = event.composedPath();

        while ((node = path.shift()) && node !== event.currentTarget)
            if (node instanceof HTMLElement && node.matches(selector))
                return handler.call(
                    this,
                    event,
                    node,
                    (event as CustomEvent).detail
                );
    };
}

export const documentReady = new Promise(resolve => {
    document.addEventListener('DOMContentLoaded', resolve);

    self.addEventListener('load', resolve);

    setTimeout(function check() {
        document.readyState === 'complete' ? resolve() : setTimeout(check);
    });
});

export function Fragment({
    defaultSlot
}: {
    defaultSlot?: VNodeChildElement[];
}) {
    return defaultSlot;
}
