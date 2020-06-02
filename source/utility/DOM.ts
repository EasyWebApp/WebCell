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
    cache: Record<string, any> = {};

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
