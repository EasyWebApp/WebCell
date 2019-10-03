import { init } from 'snabbdom';
import AttrsHelper from 'snabbdom/modules/attributes';
import PropsHelper from 'snabbdom/modules/props';
import DataHelper from 'snabbdom/modules/dataset';
import ClassHelper from 'snabbdom/modules/class';
import StyleHelper from 'snabbdom/modules/style';
import EventHelper from 'snabbdom/modules/eventlisteners';
import createElement from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';

import { Reflect, fromEntries, PlainObject, elementTypeOf } from './utility';

const { find, concat } = Array.prototype;

const patch = init([
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
    const visibleRoot = visibleFirstOf(root);

    if (visibleRoot) {
        patch(visibleRoot, node);
        return;
    }

    const element =
        node.sel && document.createElement(node.sel.split(/[#.:]/)[0]);

    if (!element) return;

    patch(element, node);

    root.appendChild(element);
}

export function create(
    tag: string | Function,
    data?: any,
    ...children: (string | VNode)[]
) {
    if (typeof tag !== 'string')
        tag = Reflect.getMetadata('tagName', tag) || tag;

    children = concat.apply([], children);

    if (typeof tag === 'function') return tag({ ...data, children });

    const { className, style, ...rest }: any = data || {};

    const [props, dataset, on] = Object.entries(rest).reduce(
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

    return elementTypeOf(tag) === 'xml'
        ? createElement(
              tag,
              { attrs: { ...props, class: className }, dataset, style, on },
              children
          )
        : createElement(
              tag,
              {
                  props,
                  dataset,
                  class:
                      typeof className === 'string'
                          ? fromEntries(
                                className
                                    .trim()
                                    .split(/\s+/)
                                    .map(name => [name, true])
                            )
                          : undefined,
                  style,
                  on
              },
              children
          );
}
