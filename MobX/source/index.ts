import { VNode } from 'snabbdom/vnode';
import { autorun } from 'mobx';
import { patch } from 'web-cell';

function wrapFunction(func: Function) {
    return function(props?: any) {
        var vTree: VNode;

        autorun(
            () => (vTree = vTree ? patch(vTree, func(props)) : func(props))
        );

        return vTree;
    };
}

function wrapClass(Class: Function) {
    const update = Class.prototype.update;

    Class.prototype.update = function() {
        autorun(() => update.call(this));
    };
}

export function observer(Class: any): Function | typeof Class {
    if (Object.getPrototypeOf(Class) === Function.prototype)
        return wrapFunction(Class);

    wrapClass(Class);
}
