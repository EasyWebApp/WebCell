import {
    init,
    attributesModule,
    propsModule,
    datasetModule,
    classModule,
    styleModule,
    eventListenersModule,
    toVNode,
    h as createElement
} from 'snabbdom';
import type { VNode } from 'snabbdom';

import {
    VNodeChildElement,
    WebCellElement,
    templateOf,
    ReadOnly_Properties,
    WebCellData,
    elementTypeOf
} from './utility';
import { WebCellClass } from './WebCell';

export const patch = init([
    attributesModule,
    propsModule,
    datasetModule,
    classModule,
    styleModule,
    eventListenersModule
]);

function createVTree(root: ParentNode & Node, nodes: WebCellElement) {
    const tree = toVNode(root);

    tree.children = (nodes instanceof Array ? nodes : [nodes])
        .filter(node => node != null)
        .map(node =>
            typeof node === 'object' ? node : ({ text: node + '' } as VNode)
        );

    return tree;
}

export function render(
    nodes: WebCellElement,
    root: ParentNode & Node = document.body,
    oldNodes: WebCellElement = []
) {
    const newTree = createVTree(root, nodes),
        oldTree = createVTree(root, oldNodes);

    patch(oldTree, newTree);

    return nodes;
}

function splitProps(raw: Record<string, any>) {
    const [attrs, dataset, on] = Object.entries(raw).reduce(
        ([attrs, dataset, on], [key, value]) => {
            const data = /^data-(.+)/.exec(key);

            if (data)
                dataset[
                    data[1].replace(/-\w/g, char => char[1].toUpperCase())
                ] = value;
            else if (/^on\w+/.test(key) && value instanceof Function)
                on[key.slice(2).toLowerCase()] = value;
            else attrs[key] = value;

            return [attrs, dataset, on];
        },
        [{}, {}, {}] as Record<string, any>[]
    );

    return { attrs, dataset, on };
}

function splitAttrs(tagName: string, raw: Record<string, any>) {
    const prototype = tagName.includes('-')
        ? (customElements.get(tagName) || '').prototype
        : Object.getPrototypeOf(templateOf(tagName));

    const { name } = prototype.constructor as Function;
    const readOnly =
        ReadOnly_Properties[name as keyof typeof ReadOnly_Properties];

    const [props, attrs] = Object.entries(raw).reduce(
        ([props, attrs], [key, value]) => {
            if (key in prototype && !readOnly?.includes(key))
                props[key] = value;
            else attrs[key] = value;

            return [props, attrs];
        },
        [{}, {}] as Record<string, any>[]
    );

    return { props, attrs };
}

export function createCell(
    tag: string | Function,
    data?: WebCellData,
    ...defaultSlot: VNodeChildElement[]
): VNode | VNode[] {
    if (typeof tag !== 'string') {
        var { tagName, renderTarget } = tag as WebCellClass;
        tag = tagName || tag;
    }

    defaultSlot = defaultSlot.flat(Infinity).filter(item => item != null);

    const { className, style, key, ref, ...rest } = data || {};

    if (typeof tag === 'function') return tag({ ...data, defaultSlot });

    const { attrs, dataset, on } = splitProps(rest),
        insert = ref && (({ elm }: { elm?: Node }) => ref(elm!));

    if (elementTypeOf(tag) === 'xml')
        return createElement(
            tag,
            {
                attrs: className ? { ...attrs, class: className } : attrs,
                dataset,
                style: style as Record<string, string>,
                on,
                key,
                hook: { insert }
            },
            defaultSlot
        );

    const maps = splitAttrs(tag, attrs);

    const meta = {
        attrs: maps.attrs,
        props: maps.props,
        dataset,
        class:
            className && typeof className === 'string'
                ? Object.fromEntries(
                      className
                          .trim()
                          .split(/\s+/)
                          .map(name => [name, true])
                  )
                : undefined,
        style: style as Record<string, string>,
        on,
        key,
        hook: { insert }
    };

    if (renderTarget !== 'children')
        return createElement(tag, meta, defaultSlot);

    meta.props.defaultSlot = defaultSlot;

    return createElement(tag, meta);
}

export function renderToStaticMarkup(vNode: WebCellElement) {
    const { body } = document.implementation.createHTMLDocument();

    render(vNode, body);

    return body.innerHTML;
}
