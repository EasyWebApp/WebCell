import {
    Constructor,
    ReadOnly_Properties,
    isHTMLElementClass,
    tagNameOf,
    templateOf,
    elementTypeOf
} from 'web-utility';
import {
    On,
    VNodeData,
    VNode,
    JsxVNodeChildren,
    Fragment,
    vnode,
    h,
    init,
    attributesModule,
    propsModule,
    datasetModule,
    classModule,
    styleModule,
    eventListenersModule,
    toVNode
} from 'snabbdom';

import { VDOMData, ComponentTag } from './utility/vDOM';

export { Fragment } from 'snabbdom';

export const patch = init([
    attributesModule,
    propsModule,
    datasetModule,
    classModule,
    styleModule,
    eventListenersModule
]);
export const treeMap = new WeakMap<Element | DocumentFragment, VNode>();

function isFragment({ sel, text }: VNode) {
    return !(sel != null) && !(text != null);
}

function createVTree(root: Element | DocumentFragment, node: VNode) {
    const tree = toVNode(root);

    tree.children = isFragment(node) ? node.children : [node];

    return tree;
}

export function render(
    node: VNode,
    root: Element | DocumentFragment = document.body
) {
    const newTree = createVTree(root, node),
        oldTree = treeMap.get(root) || toVNode(root);

    const tree = patch(oldTree, newTree);

    treeMap.set(root, tree);

    return tree;
}

function isListener(key: string, handler: any): handler is On[string] {
    return /^on[A-Z][a-z]+/.test(key) && handler instanceof Function;
}

function splitProps(tagName: string, raw: VDOMData) {
    const { constructor } = templateOf(tagName),
        isXML = elementTypeOf(tagName) === 'xml';
    const data: VNodeData = {},
        ReadOnlyProps = ReadOnly_Properties.get(
            constructor as Constructor<HTMLElement>
        );

    for (const key in raw) {
        const value = raw[key as keyof VDOMData];

        if (key === 'is') data.is = raw[key];
        else if (key === 'ref')
            (data.hook ||= {}).insert = ({ elm }) =>
                raw[key](elm as HTMLElement);
        else if (key === 'className')
            data.class = Object.fromEntries(
                raw[key]
                    .trim()
                    .split(/\s+/)
                    .map(name => [name, true])
            );
        else if (key === 'style') {
            data.style = raw[key];
        } else if (key.startsWith('data-'))
            (data.dataset ||= {})[key.slice(5)] = raw[key];
        else if (isListener(key, value))
            (data.on ||= {})[key.slice(2).toLowerCase()] = value;
        else if (isXML || key.includes('-') || ReadOnlyProps?.includes(key)) {
            (data.attrs ||= {})[key] = raw[key];
        } else {
            (data.props ||= {})[key] = value;
        }
    }
    return data;
}

export function createCell(
    tag: ComponentTag,
    props: VDOMData = {},
    ...children: JsxVNodeChildren[]
) {
    var defaultSlot: (VNode | string)[] = children
        .flat()
        .filter(node => node != null && node !== false && node !== '')
        .map(node =>
            typeof node === 'boolean' ||
            typeof node === 'number' ||
            typeof node === 'string'
                ? vnode(
                      undefined,
                      undefined,
                      undefined,
                      String(node),
                      undefined
                  )
                : node
        );
    if (defaultSlot.length === 1 && typeof defaultSlot[0] !== 'string') {
        const [{ sel, text }] = defaultSlot;

        if (!sel && text) defaultSlot = [text];
    }

    if (isHTMLElementClass(tag)) tag = tagNameOf(tag);
    else if (tag === Fragment)
        return Fragment({ key: props?.key }, ...defaultSlot);
    else if (typeof tag === 'function') return tag({ ...props, defaultSlot });

    return h(tag, splitProps(tag, props), defaultSlot);
}

export function renderToStaticMarkup(tree: VNode) {
    const { body } = document.implementation.createHTMLDocument();

    render(tree, body);

    return body.innerHTML;
}
