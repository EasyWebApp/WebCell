import View, { attributeMap, watchInput } from 'dom-renderer';

import { parse } from '../utility/resource';

import { $ as $_, makeNode, loadDOM } from '../utility/DOM';

import { delegate, trigger } from '../utility/event';

import { multipleMap } from '../utility/object';


const tag_ready = new WeakMap(),
    tag_defer = Symbol('Tag defer'),
    shadow_root = Symbol('Shadow root'),
    tag_view = new WeakMap(),
    event_handler = new Map(),
    tag_store = new WeakMap();


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
     */
    async construct(option) {

        tag_ready.set(this,  new Promise(
            (resolve, reject)  =>  this[tag_defer] = [resolve, reject]
        ));

        if (self.ShadyCSS  &&  !(ShadyCSS.nativeCss && ShadyCSS.nativeShadow))
            ShadyCSS.styleElement( this );

        const {template, store} = this.constructor;

        if ( store )
            tag_store.set(
                this,  (store instanceof Function) ? new store() : store
            );

        if ( template )  try {

            await this.buildInner( option );

        } catch (error) {

            this[tag_defer][1]( error );
        }

        (event_handler.get( this.constructor )  ||  [ ]).forEach(
            ({type, selector, handler})  =>
                this.on(type,  selector,  handler.bind( this ))
        );

        this[tag_defer][0]();
    }

    /**
     * @type {Promise}
     */
    get ready() {  return  tag_ready.get( this );  }

    /**
     * @private
     *
     * @param {?Object} option
     */
    async buildInner(option) {

        const {template, data} = this.constructor;

        const view = new View(template,  null,  {host: this});

        tag_view.set(this, view);

        this[shadow_root] = this.attachShadow(Object.assign(
            {
                mode:            'open',
                delegatesFocus:  true
            },
            option
        ));

        this[shadow_root].appendChild(await loadDOM(
            makeNode( view.topNodes ),  this.constructor.moduleBase || 'dist/'
        ));

        this.bootHook();

        await view.render(data || { });
    }

    /**
     * @private
     */
    bootHook() {

        if (this.slotChangedCallback instanceof Function)
            this.$('slot').forEach(
                slot => slot.addEventListener(
                    'slotchange',  () => this.slotChangedCallback(
                        Array.from( slot.assignedNodes() ),  slot,  slot.name
                    )
                )
            );

        if (this.viewUpdateCallback instanceof Function)
            this[shadow_root].addEventListener('render',  event => {

                const {oldData, newData, view} = event.detail;

                if (this.viewUpdateCallback(newData, oldData, view)  ===  false)
                    event.preventDefault();
            });

        if (this.viewChangedCallback instanceof Function)
            this[shadow_root].addEventListener(
                'rendered',
                ({detail: {data, view}})  =>  this.viewChangedCallback(data, view)
            );
    }

    /**
     * Get the closest parent Component instance from a Node
     *
     * @param {Node} node
     *
     * @return {?HTMLElement}
     */
    static instanceOf(node) {
        do {
            if (node instanceof this)  return node;

        } while (node = node.parentNode || node.host);
    }

    /**
     * Shared State manager
     *
     * @type {Object}
     */
    get store() {  return  tag_store.get( this );  }

    /**
     * @protected
     */
    connectedCallback() {

        if ( this.constructor.store )  return;

        var node = this;

        while (node = node.parentNode || node.host)
            if (node.constructor.store) {

                tag_store.set(this, node.store);  break;
            }
    }

    /**
     * Main view of this component
     *
     * @type {View}
     */
    get view() {  return  tag_view.get( this );  }

    /**
     * @param {Object} data
     *
     * @return {Promise}
     */
    render(data) {  return  this.view.render( data );  }

    /**
     * Set the getter & setter of the DOM property
     *
     * @private
     *
     * @param {String[]} attributes - Names of HTML attributes
     */
    static linkDataOf(attributes) {

        attributes.forEach(key => {

            key = attributeMap[key] || key;

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
        });
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

        name = attributeMap[name] || name;

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
    $(selector) {  return  $_(selector, this[shadow_root]);  }

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

        const node = /^:host/.test( selector )  ?  this[shadow_root]  :  this;

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
