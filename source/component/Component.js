import { $ as $_,  $up as $_up,  delegate } from '../utility/DOM';

import ObjectView from '../view/ObjectView';

import View from '../view/View';


/**
 * Utility methods of Web Component
 */
export default  class Component {
    /**
     * @type {string} - `tagName` of a Custom Element
     */
    static get tagName() {

        return this.name.replace(
            /[A-Z]/g,  char => '-' + char.toLowerCase()
        ).slice( 1 );
    }

    /**
     * @param {?Object} option - https://developer.mozilla.org/en-US/docs/Web/API/element/attachShadow#Parameters
     *
     * @return {HTMLElement} This custom element
     */
    buildDOM(option) {

        const shadow = this.attachShadow({
                mode:            'open',
                delegatesFocus:  true,
                ...option
            }),
            {template, style, data} = this.constructor;

        if ( template )  shadow.append( document.importNode(template, true) );

        if ( style )  shadow.prepend( style.cloneNode( true ) );

        const view = new ObjectView( shadow );

        if ( view[0] )  view.render( data );

        return this;
    }

    /**
     * Main view of this component
     *
     * @type {View}
     */
    get view() {  return  View.instanceOf( this.shadowRoot );  }

    /**
     * @param {Event} event - Event object which is created and only bubbles in the Shadow DOM
     *
     * @return {boolean} Default behavior of this event can be executed or not
     */
    bubbleOut(event) {

        return this.shadowRoot.host.dispatchEvent(
            new event.constructor(event.type, {
                bubbles:     event.bubbles,
                cancelable:  event.cancelable
            })
        );
    }

    /**
     * @param {string} selector - CSS selector
     *
     * @return {Element[]} Element set which matches `selector` in this Shadow DOM
     */
    $(selector) {  return  $_(selector, this.shadowRoot);  }

    /**
     * @param {string} selector - CSS selector
     *
     * @return {?Element} Matched parent
     */
    $up(selector) {  return  $_up(selector, this);  }

    /**
     * @param {string} selector - CSS selector
     *
     * @return {Element[]} Matched elements which assigned to slots
     */
    $slot(selector) {

        return  [ ].concat(
            ... this.$('slot').map(slot => slot.assignedNodes())
        ).filter(
            node  =>  node.matches && node.matches( selector )
        );
    }

    /**
     * Delegate listener for DOM events
     *
     * @param {string}          type       - Name of a DOM event
     * @param {string}          [selector] - CSS selector of delegate elements
     * @param {DOMEventHandler} callback
     *
     * @return {Element} This element
     */
    on(type, selector, callback) {

        if (selector instanceof Function)  callback = selector, selector = '';

        this.addEventListener(
            type,  selector ? delegate(selector, callback) : callback
        );

        return this;
    }
}

/**
 * @typedef {function(event: Event): *} DOMEventHandler
 */


const attr_prop = {
    class:     'className',
    for:       'htmlFor',
    readonly:  'readOnly'
};

/**
 * Set the getter & setter of the DOM property
 *
 * @private
 *
 * @param {string[]} attributes - Names of HTML attributes
 *
 * @return {string[]} `attributes`
 */
export function linkDataOf(attributes) {

    for (let key of attributes) {

        key = attr_prop[key] || key;

        if (! (key in this.prototype))
            Object.defineProperty(this.prototype, key, {
                set:         function (value) {

                    this.view.commit(key, value);
                },
                get:         function () {

                    return  this.view.data[ key ];
                },
                enumerable:  true
            });
    }

    return attributes;
}


/**
 * Assign the new value to the DOM property
 * which has the same name of the changed attribute
 *
 * @param {string}  name
 * @param {?string} oldValue
 * @param {?string} newValue
 *
 * @return {*} DOM property value of `newValue`
 */
export function attributeChanged(name, oldValue, newValue) {

    name = attr_prop[name] || name;

    switch ( newValue ) {
        case '':      return  this[ name ] = true;
        case null:    return  this[ name ] = false;
        default:      try {
            return  this[ name ] = JSON.parse( newValue );

        } catch (error) {

            return  this[ name ] = newValue;
        }
    }
}
