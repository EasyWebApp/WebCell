import { init } from 'snabbdom';
import PropsHelper from 'snabbdom/modules/props';
import DataHelper from 'snabbdom/modules/dataset';
import ClassHelper from 'snabbdom/modules/class';
import StyleHelper from 'snabbdom/modules/style';
import EventHelper from 'snabbdom/modules/eventlisteners';
import { VNode } from 'snabbdom/vnode';

const { find } = Array.prototype;

export const patch = init([
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

export type PlainObject = { [key: string]: any };

export function fromEntries(list: (string | any)[][]) {
    return list.reduce(
        (object, [key, value]) => ((object[key] = value), object),
        {} as PlainObject
    );
}
