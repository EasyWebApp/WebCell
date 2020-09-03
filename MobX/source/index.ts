import { WebCellProps, WebCellClass, VNode, patch } from 'web-cell';
import { autorun } from 'mobx';

export type FunctionComponent<P extends WebCellProps = WebCellProps> = (
    props?: P
) => VNode;

function wrapFunction<P>(func: FunctionComponent<P>) {
    return function (props?: P) {
        var vTree: VNode;

        autorun(
            () => (vTree = vTree ? patch(vTree, func(props)) : func(props))
        );
        return vTree;
    };
}

function wrapClass<P, S>(Class: WebCellClass<P, S>) {
    const { update } = Class.prototype;

    Class.prototype.update = function () {
        autorun(() => update.call(this));
    };
}

export function observer<P, S>(
    Class: FunctionComponent<P> | WebCellClass<P, S>
): any {
    if (Object.getPrototypeOf(Class) === Function.prototype)
        return wrapFunction(Class as FunctionComponent<P>);

    wrapClass(Class as WebCellClass<P, S>);
}
