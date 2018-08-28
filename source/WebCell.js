import { inSubDOM, inHead } from './utility/DOM';

import Component, { attributeChanged } from './Component';

import { extend } from './utility/object';


function dataInject(constructor) {

    const { observedAttributes, attributeChangedCallback } =
        Object.getOwnPropertyDescriptors( constructor );

    if ( observedAttributes )
        Object.defineProperty(constructor, 'observedAttributes', {
            get:  function () {

                const attribute = observedAttributes.get.call( this );

                for (let key of attribute)  if (! (key in this.prototype))
                    Object.defineProperty(this.prototype, key, {
                        set:         function (value) {

                            this.view.commit(key, value);
                        },
                        get:         function () {

                            return  this.view.data[ key ];
                        },
                        enumerable:  true
                    });

                return attribute;
            }
        });

    if (! attributeChangedCallback)
        Object.defineProperty(constructor.prototype, 'attributeChangedCallback', {
            value:  attributeChanged
        });
}


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

    dataInject( extend(subClass,  Component,  static_member) );

    customElements.define(subClass.tagName, subClass);

    return subClass;
}


export { Component };

export * from './utility/object';

export * from './utility/DOM';

export * from './utility/HTTP';

export {default as Template} from './view/Template';

export {default as View} from './view/View';

export {default as ObjectView} from './view/ObjectView';

export {default as ArrayView} from './view/ArrayView';
