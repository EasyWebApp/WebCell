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

export type CSSValue = string | number | CSSObject;

export interface CSSObject {
    [key: string]: CSSValue;
}

export function stringifyCSS(data: CSSObject, depth = 0): string {
    const indent = ' '.repeat(4 * depth),
        [simple, nested] = Object.entries(data).reduce(
            ([simple, nested], [key, value]) => {
                if (typeof value !== 'object') simple.push([key, value]);
                else nested.push([key, value]);

                return [simple, nested];
            },
            [[], []] as CSSValue[][][]
        );

    return simple[0]
        ? simple.map(([key, value]) => `${indent}${key}: ${value};\n`).join('')
        : nested
              .map(
                  ([key, value]) => `${indent}${key} {
${stringifyCSS(value as CSSObject, depth + 1)}${indent}}\n`
              )
              .join('');
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

export type DelegateEventHandler = (
    event: Event,
    currentTarget: Element,
    detail: any
) => any;

export function delegate(selector: string, handler: DelegateEventHandler) {
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

type LanguageMap<T> = {
    [K in keyof T]: string;
};

interface I18nData<T> {
    [language: string]: () => Promise<LanguageMap<T>>;
}

export function createI18nScope<T = {}>(
    data: I18nData<T>,
    defaultLanguage: string
) {
    var map: LanguageMap<T> | null = null;

    return {
        loaded: (async () => {
            for (const name of new Set(
                navigator.languages.concat(defaultLanguage)
            ))
                try {
                    if ((map = await data[name]?.())) break;
                } catch (error) {
                    console.error(error);
                }

            if (!map) throw Error('No available I18n data');
        })(),
        i18nTextOf: (key: keyof T) => map?.[key]
    };
}
