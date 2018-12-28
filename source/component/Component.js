import ObjectView from '../view/ObjectView';

import View from '../view/View';

import { parse } from '../utility/resource';

import { $ as $_,  $up as $_up,  delegate, watchInput, trigger } from '../utility/DOM';

import { multipleMap } from '../utility/object';


const attr_prop = {
        class:     'className',
        for:       'htmlFor',
        readonly:  'readOnly'
    },
    event_handler = new Map();


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

    get [Symbol.toStringTag]() {  return this.constructor.name;  }

    /**
     * @private
     *
     * @param {String}   type
     * @param {String}   selector
     * @param {Function} handler
     */
    static on(type, selector, handler) {

        var map = event_handler.get( this );

        if (! map)  event_handler.set(this,  map = [ ]);

        map.push({type, selector, handler});
    }

    /**
     * @param {?Object} option - https://developer.mozilla.org/en-US/docs/Web/API/element/attachShadow#Parameters
     *
     * @return {HTMLElement} This custom element
     */
    buildDOM(option) {

        if (self.ShadyCSS  &&  !(ShadyCSS.nativeCss && ShadyCSS.nativeShadow))
            ShadyCSS.styleElement( this );

        const shadow = this.attachShadow({
                mode:            'open',
                delegatesFocus:  true,
                ...option
            }),
            {template, data} = this.constructor;

        if ( template )
            shadow.appendChild( document.importNode(template, true) );

        this.bootHook();

        const view = new ObjectView( shadow );

        if ( view[0] )  view.render(data || { });

        const map = event_handler.get( this.constructor )  ||  '';

        for (let {type, selector, handler}  of  map)
            this.on(type,  selector,  handler.bind( this ));

        return this;
    }

    /**
     * @private
     */
    bootHook() {

        if (this.slotChangedCallback instanceof Function)
            for (let slot of this.$('slot'))
                slot.addEventListener(
                    'slotchange',  () => this.slotChangedCallback(
                        [... slot.assignedNodes()],  slot,  slot.name
                    )
                );

        if (this.viewUpdateCallback instanceof Function)
            this.shadowRoot.addEventListener('update',  event => {

                const {oldData, newData, view} = event.detail;

                if (this.viewUpdateCallback(newData, oldData, view)  ===  false)
                    event.preventDefault();
            });

        if (this.viewChangedCallback instanceof Function)
            this.shadowRoot.addEventListener(
                'updated',
                ({detail: {data, view}})  =>  this.viewChangedCallback(data, view)
            );
    }

    /**
     * Main view of this component
     *
     * @type {View}
     */
    get view() {  return  View.instanceOf( this.shadowRoot );  }

    /**
     * Set the getter & setter of the DOM property
     *
     * @private
     *
     * @param {string[]} attributes - Names of HTML attributes
     *
     * @return {string[]} `attributes`
     */
    static linkDataOf(attributes) {

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
     * @protected
     *
     * @param {string}  name
     * @param {?string} oldValue
     * @param {?string} newValue
     *
     * @return {*} DOM property value of `newValue`
     */
    attributeChangedCallback(name, oldValue, newValue) {

        name = attr_prop[name] || name;

        switch ( newValue ) {
            case '':      return  this[ name ] = true;
            case null:    return  this[ name ] = false;
            default:      try {
                return  this[ name ] = parse( newValue );

            } catch (error) {

                return  this[ name ] = newValue;
            }
        }
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

        return multipleMap(
            multipleMap(this.$('slot'),  slot => slot.assignedNodes()),
            node => {

                if (!(node instanceof Element))  return;

                const list = [ ];

                if (node.matches( selector ))  list[0] = node;

                return  list.concat( $_(selector, node) );
            }
        );
    }

    /**
     * Delegate listener for DOM events
     *
     * @param {string}       type       - Name of a DOM event
     * @param {string}       [selector] - CSS selector of delegate elements
     * @param {EventHandler} callback
     *
     * @return {Element} This element
     */
    on(type, selector, callback) {

        if (selector instanceof Function)  callback = selector, selector = '';

        const node = /^:host/.test( selector )  ?  this.shadowRoot  :  this;

        callback = selector  ?  delegate(selector, callback)  :  callback;

        if (type === 'input') {

            const origin = callback;

            callback = function (event) {

                if (event instanceof CustomEvent)  origin.apply(this, arguments);
            };
        }

        node.addEventListener(type, callback);

        if (type === 'input')  watchInput( node );

        return this;
    }

    /**
     * @param {String|Event} event
     * @param {?*}           detail     - Additional data
     * @param {?Boolean}     bubbles
     * @param {?Boolean}     cancelable
     * @param {?Boolean}     composed   - Whether the event will cross
     *                                    from the shadow DOM into the standard DOM
     *                                    after reaching the shadow root
     * @return {Boolean} Event be canceled or not
     */
    trigger(event, detail, bubbles, cancelable, composed) {

        return  trigger(this, event, detail, bubbles, cancelable, composed);
    }
}

/**
 * @typedef {function(event: Event): *} EventHandler
 */
