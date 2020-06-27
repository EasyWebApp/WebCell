import { WebCellProps, WebCellClass, VNode, patch } from 'web-cell';
import { autorun } from 'mobx';

export type FunctionComponent = (props?: WebCellProps) => VNode;

function wrapFunction(func: FunctionComponent) {
    return function (props?: WebCellProps) {
        var vTree: VNode;

        autorun(
            () => (vTree = vTree ? patch(vTree, func(props)) : func(props))
        );
        return vTree;
    };
}

function wrapClass(Class: WebCellClass) {
    const { update } = Class.prototype;

    Class.prototype.update = function () {
        autorun(() => update.call(this));
    };
}

export function observer(Class: FunctionComponent | WebCellClass): any {
    if (Object.getPrototypeOf(Class) === Function.prototype)
        return wrapFunction(Class as FunctionComponent);

    wrapClass(Class as WebCellClass);
}
