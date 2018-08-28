import { parseDOM } from './utility/DOM';

import ObjectView from './view/ObjectView';

import View from './view/View';


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
     * @param {?(string|Node)} template - HTML source or sub DOM tree
     * @param {string}         [style]  - CSS source
     *
     * @return {HTMLElement} This custom element
     */
    buildDOM(template, style) {

        const shadow = this.attachShadow({
            mode:              'open',
            delegatesFocus:    true
        });

        if (typeof template === 'string') {

            template = parseDOM( template );

            let element = template.querySelector('template');

            template = element ? element.content : template;
        } else
            template = template || this.constructor.template;

        if ( template )  shadow.append( document.importNode(template, true) );

        if ( style )
            shadow.prepend(Object.assign(
                document.createElement('style'),  {textContent: style}
            ));

        const view = new ObjectView( shadow ), data = this.constructor.data;

        if ( data )  view.render( data );

        return this;
    }

    /**
     * Main view of this component
     *
     * @type {View}
     */
    get view() {  return  View.instanceOf( this.shadowRoot );  }

    /**
     * @param {Element} element
     *
     * @return {number} The index of `element` in its siblings
     */
    static indexOf(element) {

        var index = 0;

        while (element = element.previousElementSibling)  index++;

        return index;
    }

    /**
     * @param {Event} event
     *
     * @return {Element} The target of `event` object (**Shadow DOM** is in account)
     */
    static targetOf(event) {

        const target = event.composedPath ? event.composedPath() : event.path;

        return  (target || '')[0]  ||  event.target;
    }

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
     * @private
     *
     * @return   {Object}
     * @property {HTMLTemplateElement}                      template
     * @property {Array<HTMLStyleElement, HTMLLinkElement>} style
     * @property {HTMLScriptElement}                        script
     */
    static findTemplate() {

        var script = document.currentScript, template, style = [ ];

        var element = script, stop;

        while ((! stop)  &&  (element = element.previousElementSibling))
            switch ( element.tagName.toLowerCase() ) {
                case 'template':
                    template = element.content;  break;
                case 'style':
                    style.unshift( element );  break;
                case 'link':
                    if (element.rel === 'stylesheet') {

                        element.setAttribute('href', element.href);

                        style.unshift( element );
                    }
                    break;
                case 'script':
                    stop = true;
            }

        if ( style[0] )  template.prepend(... style);

        return  {template, style, script};
    }

    /**
     * @param {string} selector - CSS selector
     *
     * @return {Element[]} Element set which matches `selector` in this Shadow DOM
     */
    $(selector) {

        return  [... this.shadowRoot.querySelectorAll( selector )];
    }

    /**
     * @param {string} selector - CSS selector
     *
     * @return {?Element} Matched parent
     */
    $up(selector) {

        var element = this;

        while ( element.parentNode ) {

            element = element.parentNode;

            if (element.matches  &&  element.matches( selector ))
                return element;
        }
    }

    /**
     * DOM event delegate
     *
     * @private
     *
     * @param {string}          selector
     * @param {DOMEventHandler} handler
     *
     * @return {Function} Handler wrapper
     */
    static delegate(selector, handler) {

        const $up = Component.prototype.$up;

        return  function (event) {

            var target = Component.targetOf( event );

            if (! target.matches( selector ))
                target = $up.call(target, selector);

            if ( target )  return handler.call(target, event);
        };
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
            type,  selector ? Component.delegate(selector, callback) : callback
        );

        return this;
    }
}

/**
 * @typedef {function(event: Event): *} DOMEventHandler
 */


/**
 * @private
 *
 * @param {string} name
 * @param {*}      oldValue
 * @param {*}      newValue
 */
export function attributeChanged(name, oldValue, newValue) {

    switch ( newValue ) {
        case '':      this[ name ] = true;      break;
        case null:    this[ name ] = false;     break;
        default:      try {
            this[ name ] = JSON.parse( newValue );

        } catch (error) {

            this[ name ] = newValue;
        }
    }
}
