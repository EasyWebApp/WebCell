import { inSubDOM, inHead } from './utility/DOM';

import Component, { linkDataOf, attributeChanged } from './component/Component';

import { getPropertyDescriptor, extend } from './utility/object';


function dataInject(constructor) {

    const observedAttributes = getPropertyDescriptor(
        constructor, 'observedAttributes'
    );

    if (! observedAttributes)  return;

    Object.defineProperty(constructor, 'observedAttributes', {
        get:  function () {

            return  linkDataOf.call(this, observedAttributes.get.call( this ));
        }
    });

    const attributeChangedCallback = getPropertyDescriptor(
        constructor.prototype, 'attributeChangedCallback'
    );

    if (! attributeChangedCallback)
        Object.defineProperty(constructor.prototype, 'attributeChangedCallback', {
            value:  attributeChanged
        });
}


/**
 * Register a component
 *
 * @param {function} subClass
 * @param {string}   [baseTag] - Name of an HTML original tag to extend
 *
 * @return {function} `subClass`
 */
export function component(subClass, baseTag) {

    const static_member = { };

    if (inSubDOM()  ||  (! inHead())) {

        let { template } = Component.findTemplate();

        Object.defineProperty(static_member,  'template',  {
            get:         () => template,
            enumerable:  true
        });
    }

    dataInject( extend(subClass,  Component,  static_member) );

    customElements.define(
        subClass.tagName,  subClass,  baseTag && {extends: baseTag}
    );

    return subClass;
}


export { Component, attributeChanged };

export {default as InputComponent} from './component/InputComponent';

export * from './utility/object';

export * from './utility/DOM';

export * from './utility/HTTP';

export {default as Template} from './view/Template';

export {default as View} from './view/View';

export {default as ObjectView} from './view/ObjectView';

export {default as ArrayView} from './view/ArrayView';
