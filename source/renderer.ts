import { init } from 'snabbdom/src/snabbdom';
import AttrsHelper from 'snabbdom/src/modules/attributes';
import PropsHelper from 'snabbdom/src/modules/props';
import DataHelper from 'snabbdom/src/modules/dataset';
import ClassHelper from 'snabbdom/src/modules/class';
import StyleHelper from 'snabbdom/src/modules/style';
import EventHelper from 'snabbdom/src/modules/eventlisteners';
import { VNode } from 'snabbdom/src/vnode';
import toVNode from 'snabbdom/src/tovnode';
import createElement, { VNodeChildElement } from 'snabbdom/src/h';

import { Reflect, PlainObject, templateOf, elementTypeOf } from './utility';

export { VNode } from 'snabbdom/src/vnode';
export { VNodeChildElement } from 'snabbdom/src/h';

export const patch = init([
    AttrsHelper,
    PropsHelper,
    DataHelper,
    ClassHelper,
    StyleHelper,
    EventHelper
]);

function createVTree(
    root: ParentNode & Node,
    nodes: VNodeChildElement | VNodeChildElement[]
) {
    const tree = toVNode(root);

    tree.children = (nodes instanceof Array ? nodes : [nodes])
        .filter(node => node != null)
        .map(node =>
            typeof node === 'string' || typeof node === 'object'
                ? node
                : node + ''
        );

    return tree;
}

export function render(
    nodes: VNodeChildElement | VNodeChildElement[],
    root: ParentNode & Node = document.body,
    oldNodes: VNodeChildElement | VNodeChildElement[] = []
) {
    const newTree = createVTree(root, nodes),
        oldTree = createVTree(root, oldNodes);

    patch(oldTree, newTree);

    return nodes;
}

function splitProps(raw: any) {
    const [attrs, dataset, on] = Object.entries(raw).reduce(
        (objects, [key, value]) => {
            const data = /^data-(.+)/.exec(key);

            if (data)
                objects[1][
                    data[1].replace(/-\w/g, char => char[1].toUpperCase())
                ] = value;
            else if (/^on\w+/.test(key))
                objects[2][key.slice(2).toLowerCase()] = value;
            else objects[0][key] = value;

            return objects;
        },
        [{}, {}, {}] as PlainObject[]
    );

    return { attrs, dataset, on };
}

function splitAttrs(tagName: string, raw: any) {
    const prototype = tagName.includes('-')
        ? (customElements.get(tagName) || '').prototype
        : Object.getPrototypeOf(templateOf(tagName));

    const [props, attrs] = Object.entries(raw).reduce(
        (objects, [key, value]) => {
            objects[key in prototype ? 0 : 1][key] = value;

            return objects;
        },
        [{}, {}] as PlainObject[]
    );

    return { props, attrs };
}

interface CellData {
    className?: string;
    style?: PlainObject;
    key?: string;
    ref?: (node: Node) => void;
}

export function createCell(
    tag: string | Function,
    data?: CellData,
    ...defaultSlot: VNodeChildElement[]
): VNode | VNode[] {
    if (typeof tag !== 'string') {
        var target = Reflect.getMetadata('renderTarget', tag);
        tag = Reflect.getMetadata('tagName', tag) || tag;
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
                style,
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
        style,
        on,
        key,
        hook: { insert }
    };

    if (target !== 'children') return createElement(tag, meta, defaultSlot);

    meta.props.defaultSlot = defaultSlot;

    return createElement(tag, meta);
}
