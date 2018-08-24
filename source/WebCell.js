import Component from './Component';

import { extend } from './utility/object';

import { inSubDOM, inHead } from './utility/DOM';


/**
 * Register a component
 *
 * @param {function} subClass
 *
 * @return {function} `subClass`
 */
export function component(subClass) {

    const static_member = { };

    if (inSubDOM()  ||  (! inHead())) {

        let { template } = Component.findTemplate();

        Object.defineProperty(static_member,  'template',  {
            get:         () => template,
            enumerable:  true
        });
    }

    extend(subClass,  Component,  static_member);

    customElements.define(subClass.tagName, subClass);

    return subClass;
}


export { Component };

export {default as View} from './view/View';

export {default as ObjectView} from './view/ObjectView';

export {default as ArrayView} from './view/ArrayView';
