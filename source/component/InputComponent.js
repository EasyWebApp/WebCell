import { watchAttributes } from '../utility/DOM';

import { attributeChanged } from './Component';


const CSS_map = {
    readonly:  {
        cursor:  'default'
    },
    disabled:  {
        cursor:          'not-allowed',
        'point-events':  'none'
    }
};

/**
 * Base class for Form field components
 */
export default  class InputComponent extends HTMLElement {
    /**
     * @param {string} template - HTML source code with template expressions
     * @param {string} [style]  - CSS source code
     */
    constructor(template, style) {  super().buildDOM(template, style);  }

    connectedCallback() {

        const origin = this.$slot('input')[0], proxy = this.$('input')[0];

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

        if (! style)  return;

        if ( newValue )
            for (let name in style)
                this.style.setProperty(`--input-${name}`,  style[ name ]);
        else
            for (let name in style)
                this.style.removeProperty(`--input-${name}`);
    }

    /**
     * @type {string}
     */
    get defaultValue() {  return this.getAttribute('value');  }
}
