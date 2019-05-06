import { parseDOM, debounce as _debounce, throttle as _throttle } from 'dom-renderer';

import Component from './Component';

import { multipleMap, decoratorOf, unique } from '../utility/object';

import { delegate } from '../utility/event';

import { blobFrom } from '../utility/resource';


const { attributeChangedCallback } = Component.prototype;


/**
 * Decorator for `observedAttributes` getter
 *
 * @param {DecoratorDescriptor} meta
 */
export function mapProperty(meta) {

    const getter = meta.descriptor.get;

    meta.descriptor.get = function () {

        const list = getter.call( this );

        list.forEach(key => {
            if (
                Object.getOwnPropertyDescriptor(HTMLElement.prototype, key)  &&
                !Object.getOwnPropertyDescriptor(this.constructor.prototype, key)
            )
                throw ReferenceError(
                    `HTML DOM property "${key}" getter should be overwritten`
                );
        });

        return  this.linkDataOf( list ) || list;
    };
}


/**
 * Decorator for `attributeChangedCallback()` method
 *
 * @param {DecoratorDescriptor} meta
 */
export function mapData(meta) {

    const origin = meta.descriptor.value;

    meta.descriptor.value = function (name, oldValue) {

        origin.call(
            this,  name,  oldValue,  attributeChangedCallback.apply(this, arguments)
        );
    };
}


/**
 * Decorator for Property getter which returns Data URI
 *
 * @param {DecoratorDescriptor} meta
 */
export function blobURI(meta) {

    var getter = meta.descriptor.get, blob;

    meta.descriptor.get = function () {

        return  blob || (
            blob = URL.createObjectURL(
                blobFrom( getter.apply(this, arguments) )
            )
        );
    };
}


/**
 * @param {String} selector - CSS selector
 *
 * @return {Decorator} Decorator for Event handler
 */
export function at(selector) {

    return  ({ descriptor }) => {

        descriptor.value = delegate(selector, descriptor.value);
    };
}


/**
 * @param {String} type
 * @param {String} selector
 *
 * @return {Decorator} Decorator for Event handler
 */
export function on(type, selector) {

    return  meta => {

        meta.finisher = Class => {

            Class.on(type, selector, meta.descriptor.value);
        };
    };
}


/**
 * Wrap a method or setter to debounce
 *
 * @param {Number} [seconds=0.25]
 *
 * @return {Decorator}
 */
export function debounce(seconds = 0.25) {

    return  ({ descriptor }) => {

        if (descriptor.value instanceof Function)
            descriptor.value = _debounce(descriptor.value, seconds);
        else if (descriptor.set instanceof Function)
            descriptor.set = _debounce(descriptor.set, seconds);
    };
}


/**
 * Wrap a method or getter to throttle
 *
 * @param {Number} [seconds=0.25]
 *
 * @return {Decorator}
 */
export function throttle(seconds) {

    return  ({ descriptor }) => {

        if (descriptor.value instanceof Function)
            descriptor.value = _throttle(descriptor.value, seconds);
        else if (descriptor.get instanceof Function)
            descriptor.get = _throttle(descriptor.get, seconds);
    };
}


const skip_key = {
    name:         1,
    length:       1,
    prototype:    1,
    caller:       1,
    arguments:    1,
    call:         1,
    apply:        1,
    bind:         1,
    constructor:  1
};

function decoratorMix(mixin) {

    const isClass = mixin instanceof Function;

    return multipleMap(
        Object.entries( Object.getOwnPropertyDescriptors( mixin ) ),
        ([key, meta]) => {

            if (! (isClass  ?  skip_key[key]  :  (
                (key === 'constructor')  &&  (meta.value instanceof Function)
            )))
                return  decoratorOf(mixin,  key,  meta.value || meta);
        }
    );
}


function defineTemplate(meta, template, style) {

    if ( template ) {

        template = parseDOM( (template + '').trim() );

        let _temp_ = template.querySelector('template');

        if (! _temp_) {

            _temp_ = document.createElement('template');

            _temp_.content.appendChild( template );
        }

        template = _temp_;
    }

    if ( style ) {

        template = template || document.createElement('template');

        template.content.insertBefore(
            Object.assign(
                document.createElement('style'),  {textContent: style}
            ),
            template.content.firstChild
        );

        meta.push( decoratorOf(Component, 'style', style) );
    }

    if ( template ) {

        template = template.innerHTML;

        meta.push( decoratorOf(Component, 'template', template) );
    }

    return template;
}

function appendMixin(Sub, mixin, key) {

    const origin = Sub[key];

    if (origin === mixin[key]) {

        const Super = Object.getPrototypeOf( Sub );

        if ( Super[key] )
            Object.defineProperty(Sub, key, {
                value:         function () {

                    mixin[key].call(this, arguments),
                    Super[key].call(this, arguments);
                },
                enumerable:    true,
                configurable:  true
            });
    } else
        Object.defineProperty(Sub, key, {
            value:         function () {

                mixin[key].call(this, arguments), origin.call(this, arguments);
            },
            enumerable:    true,
            configurable:  true
        });
}

/**
 * Register a component
 *
 * @param {Object}         meta
 * @param {String|Node}    [meta.template] - HTML template source or sub DOM tree
 * @param {String|Element} [meta.style]    - CSS source or `<style />`
 * @param {Object}         [meta.data]     - Initial data
 * @param {String}         [meta.tagName]  - Name of an HTML original tag to extend
 *
 * @return {Decorator} Component Class decorator
 */
export function component(meta = { }) {

    var {template, style, data, tagName, store} = meta;

    return  ({ elements }) => {

        const merged = (template || style)  &&
            defineTemplate(elements, template, style);

        if ( data )  elements.push( decoratorOf(Component, 'data', data) );

        if ( store )  elements.push( decoratorOf(Component, 'store', store) );

        elements.push.apply(
            elements,
            decoratorMix( Component ).concat(
                decoratorMix( Component.prototype )
            )
        );

        return {
            kind:           'class',
            elements:       unique(
                elements,
                (A, B)  =>  ((A.key !== B.key) || (A.placement !== B.placement))
            ),
            finisher(Class) {
                if (
                    merged  &&  self.ShadyCSS  &&
                    !(ShadyCSS.nativeCss && ShadyCSS.nativeShadow)
                )
                    ShadyCSS.prepareTemplate(merged, Class.tagName);

                appendMixin(
                    Class.prototype, Component.prototype, 'connectedCallback'
                );

                self.customElements.define(
                    Class.tagName,  Class,  tagName && {extends: tagName}
                );
            }
        };
    };
}
