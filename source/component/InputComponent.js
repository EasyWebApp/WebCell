import { watchAttributes } from '../utility/DOM';

import Component from './Component';


const CSS_map = {
        readonly:  {
            cursor:  'default'
        },
        disabled:  {
            cursor:          'not-allowed',
            'point-events':  'none'
        }
    },
    { attributeChangedCallback } = Component.prototype;


/**
 * Base class for Form field components
 */
export default  class InputComponent extends HTMLElement {
    /**
     * @param {?Object} option - https://developer.mozilla.org/en-US/docs/Web/API/element/attachShadow#Parameters
     */
    constructor(option) {  super().construct( option );  }

    /**
     * @protected
     */
    slotChangedCallback() {

        const origin = this.$slot('input')[0];

        if (! origin)  return;

        origin.style.setProperty('display', 'none', 'important');

        watchAttributes.call(
            this,
            origin,
            [
                'type', 'name', 'value',
                'readonly', 'disabled', 'checked', 'placeholder'
            ],
            this.changedPropertyOf
        );

        this.on(
            'input',
            `:host input[type="${origin.type}"]`,
            ({ target })  =>  origin.value = target.value
        ).on(
            'change',
            `:host input[type="${origin.type}"]`,
            this.trigger.bind( this )
        );
    }

    /**
     * Common behavior of Form field attributes
     *
     * @param {string}  attribute
     * @param {?string} oldValue
     * @param {?string} newValue
     */
    changedPropertyOf(attribute, oldValue, newValue) {

        if ((attribute === 'type')  &&  !newValue)  newValue = 'text';

        newValue = attributeChangedCallback.call(
            this.view, attribute, oldValue, newValue
        );

        const style = CSS_map[ attribute ];

        if ( style )
            for (let key in style)
                this.style[
                    newValue ? 'setProperty' : 'removeProperty'
                ](
                    `--input-${key}`,  style[ key ]
                );
    }

    /**
     * @type {string}
     */
    get defaultValue() {  return this.getAttribute('value');  }
}
