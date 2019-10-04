import { autorun } from 'mobx';

export function observer(Class: Function) {
    const update = Class.prototype.update;

    Class.prototype.update = function() {
        autorun(() => update.call(this));
    };
}
