import { WebCellProps, VNode, WebCellComponent, patch } from 'web-cell';
import { autorun } from 'mobx';

export type FunctionComponent = (props?: WebCellProps) => VNode;
export type ClassComponent = { new (): WebCellComponent };

function wrapFunction(func: FunctionComponent) {
    return function (props?: WebCellProps) {
        var vTree: VNode;

        autorun(
            () => (vTree = vTree ? patch(vTree, func(props)) : func(props))
        );
        return vTree;
    };
}

function wrapClass(Class: ClassComponent) {
    const update = Class.prototype.update;

    Class.prototype.update = function () {
        autorun(() => update.call(this));
    };
}

export function observer(Class: FunctionComponent | ClassComponent): any {
    if (Object.getPrototypeOf(Class) === Function.prototype)
        return wrapFunction(Class as FunctionComponent);

    wrapClass(Class as ClassComponent);
}
