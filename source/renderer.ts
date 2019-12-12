import 'core-js/es/object/from-entries';
import 'core-js/es/array/flat';

import { init } from 'snabbdom';
import AttrsHelper from 'snabbdom/modules/attributes';
import PropsHelper from 'snabbdom/modules/props';
import DataHelper from 'snabbdom/modules/dataset';
import ClassHelper from 'snabbdom/modules/class';
import StyleHelper from 'snabbdom/modules/style';
import EventHelper from 'snabbdom/modules/eventlisteners';
import createElement, { VNodeChildElement } from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';

import { Reflect, PlainObject, templateOf, elementTypeOf } from './utility';

const { slice } = Array.prototype;

export { VNode } from 'snabbdom/vnode';
export { VNodeChildElement } from 'snabbdom/h';

export const patch = init([
    AttrsHelper,
    PropsHelper,
    DataHelper,
    ClassHelper,
    StyleHelper,
    EventHelper
]);

export function render(
    nodes: VNodeChildElement | VNodeChildElement[],
    root: ParentNode & Node = document.body,
    oldNodes: VNodeChildElement | VNodeChildElement[] = []
) {
    nodes = (nodes instanceof Array ? nodes : [nodes]).filter(
        node => node != null
    );
    oldNodes = (oldNodes instanceof Array ? oldNodes : [oldNodes]).filter(
        node => node != null
    );

    for (let i = 0; i < nodes.length; i++) {
        let node = root.childNodes[i],
            vNode = nodes[i];

        if (typeof vNode !== 'object') {
            if (node) node.nodeValue = vNode + '';
            else root.append(vNode + '');

            continue;
        }

        if (!oldNodes[i]) {
            const tag = (vNode as VNode).sel!.split(/[#.:]/)[0];

            if (!node) node = root.appendChild(document.createElement(tag));
            else if (node.nodeName.toLowerCase() !== tag) {
                const old = node;

                root.replaceChild((node = document.createElement(tag)), old);
            }
        }

        nodes[i] = patch(
            (oldNodes[i] as VNode) || (node as Element),
            nodes[i] as VNode
        );
    }

    for (const node of slice.call(root.childNodes, nodes.length)) node.remove();

    return nodes;
}

interface LanguageMap {
    [text: string]: string;
}

interface I18nData {
    [language: string]: () => Promise<LanguageMap>;
}

var languageMap: LanguageMap;

export async function setI18n(data: I18nData) {
    for (const name of self.navigator.languages)
        if (name in data) {
            languageMap = await data[name]();
            break;
        }

    return languageMap;
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
    i18n?: boolean;
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

    const { className, style, key, ref, i18n, ...rest } = data || {};

    if (languageMap && i18n)
        defaultSlot = defaultSlot.map(node =>
            typeof node === 'string' ? languageMap[node] ?? node : node
        );

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
