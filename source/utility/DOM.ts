import type { CSSStyles } from 'web-utility';
import { toHyphenCase } from './data';

export type CSSRule = Record<string, CSSStyles>;
export type CSSObject = CSSRule | Record<string, CSSRule>;

export function stringifyCSS(
    data: CSSStyles | CSSObject,
    depth = 0,
    indent = '    '
): string {
    const padding = indent.repeat(depth);

    return Object.entries(data)
        .map(([key, value]) =>
            typeof value !== 'object'
                ? `${padding}${toHyphenCase(key)}: ${value};`
                : `${padding}${key} {
${stringifyCSS(value as CSSObject, depth + 1, indent)}
${padding}}`
        )
        .join('\n');
}

const spawn = document.createElement('template'),
    cache: Record<string, Element> = {};

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

// fetch from https://html.spec.whatwg.org/

export const ReadOnly_Properties = {
    HTMLLinkElement: ['sizes'],
    HTMLIFrameElement: ['sandbox'],
    HTMLObjectElement: ['form'],
    HTMLInputElement: ['form', 'list'],
    HTMLButtonElement: ['form'],
    HTMLSelectElement: ['form'],
    HTMLTextAreaElement: ['form'],
    HTMLOutputElement: ['form'],
    HTMLFieldSetElement: ['form']
};
