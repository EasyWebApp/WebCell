import { attributeChanged } from './Component';


const cursor_map = {
    readonly:  'default',
    disabled:  'not-allowed'
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

    /**
     * @type {string[]} Common attributes of Form fields
     */
    static get observedAttributes() {

        return [
            'type', 'value', 'readonly', 'disabled', 'checked', 'placeholder'
        ];
    }

    /**
     * Common behavior of Form field attributes
     *
     * @param {string}  name
     * @param {?string} oldValue
     * @param {?string} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {

        if ((name === 'type')  &&  !newValue)  newValue = 'text';

        newValue = attributeChanged.call(this, name, oldValue, newValue);

        if (cursor_map[ name ])
            if ( newValue )
                this.style.setProperty('--input-cursor',  cursor_map[name]);
            else
                this.style.removeProperty('--input-cursor');
    }

    /**
     * @type {string}
     */
    get defaultValue() {  return this.getAttribute('value');  }
}
