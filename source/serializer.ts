import { PlainObject } from './utility';
import { VNode, VNodeChildElement } from './renderer';

const VoidTag = [
        'area',
        'base',
        'br',
        'col',
        'embed',
        'hr',
        'img',
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr'
    ],
    Props2Attrs: PlainObject = {
        className: 'class',
        htmlFor: 'for'
    };

export function vNodeToMarkup({
    sel,
    data: { attrs, props, style, class: Klass, dataset } = {},
    children = []
}: VNode): string {
    const meta = [sel.split(/#|\./)[0]],
        selector = sel.match(/(#|\.)\S+?/g) || [];

    var ID = attrs?.id || props?.id,
        Class = Object.entries(Klass || {})
            .filter(([_, enable]) => enable)
            .map(item => item[0]);

    for (const item of selector)
        switch (item[0]) {
            case '#':
                if (!ID) ID = item.slice(1);
                break;
            case '.':
                if (item[1]) Class.push(item.slice(1));
        }

    if (ID) meta.push(`id="${ID}"`);

    if (Class[0]) meta.push(`class="${Class.join(' ')}"`);

    if (attrs || props)
        meta.push(
            ...Object.entries({ ...attrs, ...props }).map(([key, value]) =>
                typeof value === 'boolean'
                    ? value
                        ? key
                        : ''
                    : `${Props2Attrs[key] || key}="${value}"`
            )
        );

    if (style)
        meta.push(
            `style="${Object.entries(style)
                .filter(([key]) => key !== 'delayed' && key !== 'remove')
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ')}"`
        );

    if (dataset)
        meta.push(
            ...Object.entries(dataset).map(
                ([key, value]) => `data-${key}="${value}"`
            )
        );

    if (VoidTag.includes(meta[0])) return `<${meta.join(' ')} />`;

    children = children
        .filter(Boolean)
        .map(item =>
            typeof item === 'object' ? item.text || vNodeToMarkup(item) : item
        );

    return `<${meta.join(' ')}>${children.join('')}</${meta[0]}>`;
}

export function renderToStaticMarkup(
    vNode: VNodeChildElement | VNodeChildElement[]
) {
    return (vNode instanceof Array ? vNode : [vNode])
        .filter(Boolean)
        .map(node => (typeof node === 'object' ? vNodeToMarkup(node) : node))
        .join('');
}
