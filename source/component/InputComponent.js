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
    attributeChanged = Component.prototype.attributeChangedCallback;


/**
 * Base class for Form field components
 */
export default  class InputComponent extends HTMLElement {
    /**
     * @param {?Object} option - https://developer.mozilla.org/en-US/docs/Web/API/element/attachShadow#Parameters
     */
    constructor(option) {

        super();

        this.buildDOM( option );
    }

    /**
     * @protected
     *
     * @param {Node[]} assigned
     */
    slotChangedCallback(assigned) {

        const origin = assigned.find(node  =>  node.tagName === 'INPUT');

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

        const proxy = this.$('input')[0];

        this.on.call(proxy,  'input',  () => origin.value = proxy.value);

        this.on.call(proxy,  'change',  event => this.bubbleOut( event ));
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

        newValue = attributeChanged.call(
            this.view, attribute, oldValue, newValue
        );

        const style = CSS_map[ attribute ];

        if ( style )
            for (let [key, value]  of  Object.entries( style ))
                this.style[
                    newValue ? 'setProperty' : 'removeProperty'
                ](
                    `--input-${key}`, value
                );
    }

    /**
     * @type {string}
     */
    get defaultValue() {  return this.getAttribute('value');  }
}
