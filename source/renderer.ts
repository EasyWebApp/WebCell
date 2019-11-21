import 'ts-polyfill/lib/es2019-array';
import 'ts-polyfill/lib/es2019-object';

import { init } from 'snabbdom';
import AttrsHelper from 'snabbdom/modules/attributes';
import PropsHelper from 'snabbdom/modules/props';
import DataHelper from 'snabbdom/modules/dataset';
import ClassHelper from 'snabbdom/modules/class';
import StyleHelper from 'snabbdom/modules/style';
import EventHelper from 'snabbdom/modules/eventlisteners';
import createElement from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';

import { Reflect, PlainObject, templateOf, elementTypeOf } from './utility';

const { find } = Array.prototype;

export { VNode } from 'snabbdom/vnode';

export const patch = init([
    AttrsHelper,
    PropsHelper,
    DataHelper,
    ClassHelper,
    StyleHelper,
    EventHelper
]);

const hiddenTag = ['style', 'link', 'script'];

export function visibleFirstOf(root: Node) {
    return find.call(
        root.childNodes,
        ({ nodeType, nodeName }) =>
            nodeType === 1 && !hiddenTag.includes(nodeName.toLowerCase())
    );
}

export function render(node: VNode, root: Node = document.body) {
    var element = visibleFirstOf(root);

    if (!element && node.sel) {
        element = document.createElement(node.sel.split(/[#.:]/)[0]);

        root.appendChild(element);
    }

    if (!element) throw ReferenceError('No Element to render');

    return patch(element, node);
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
    ...defaultSlot: (string | VNode)[]
) {
    if (typeof tag !== 'string') {
        var target = Reflect.getMetadata('renderTarget', tag);
        tag = Reflect.getMetadata('tagName', tag) || tag;
    }

    defaultSlot = defaultSlot.flat(Infinity).filter(item => item != null);

    if (typeof tag === 'function') return tag({ ...data, defaultSlot });

    const { className, style, key, ref, ...rest } = data || {};

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
