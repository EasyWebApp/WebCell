import Component from './component/Component';

import { decoratorOf } from './utility/object';

import { delegate, stringifyDOM, parseDOM } from './utility/DOM';

import { blobFrom } from './utility/resource';


/**
 * Decorator for `observedAttributes` getter
 *
 * @param {DecoratorDescriptor} meta
 */
export function mapProperty(meta) {

    const getter = meta.descriptor.get;

    meta.descriptor.get = function () {

        const list = getter.call( this );

        for (let key of list)
            if (
                Object.getOwnPropertyDescriptor(HTMLElement.prototype, key)  &&
                !Object.getOwnPropertyDescriptor(this.constructor.prototype, key)
            )
                throw ReferenceError(
                    `HTML DOM property "${key}" getter should be overwritten`
                );

        return  this.linkDataOf( list );
    };
}


/**
 * Decorator for `attributeChangedCallback()` method
 *
 * @param {DecoratorDescriptor} meta
 */
export function mapData(meta) {

    const origin = meta.descriptor.value,
        onChange = Component.prototype.attributeChangedCallback;

    meta.descriptor.value = function (name, oldValue) {

        origin.call(this,  name,  oldValue,  onChange.apply(this, arguments));
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
 * @return {Function} Decorator for Event handler
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
 * @return {Function} Decorator for Event handler
 */
export function on(type, selector) {

    return  meta => {

        meta.finisher = Class => {

            Class.on(type, selector, meta.descriptor.value);
        };
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

function decoratorMix(member, mixin) {

    const isClass = mixin instanceof Function,
        property = Object.getOwnPropertyDescriptors( mixin );

    for (let [key, meta]  of  Object.entries( property ))
        if (! (isClass  ?  skip_key[key]  :  (
            (key === 'constructor')  &&  (meta.value instanceof Function)
        ))) {
            const item = decoratorOf(mixin,  key,  meta.value || meta);

            if (! member.some(old =>
                ((old.key === item.key) && (old.placement === item.placement))
            ))
                member.push( item );
        }
}


function define(meta, template, style) {

    if ( template ) {

        if (template instanceof Node)  template = stringifyDOM( template );

        template = parseDOM( (template + '').trim() );

        if (template.firstChild.tagName !== 'TEMPLATE') {

            let temp = document.createElement('template');

            temp.content.appendChild( template );

            template = temp;
        } else
            template = template.firstChild;
    } else
        template = document.createElement('template');

    meta.push( decoratorOf(Component, 'template', template.content) );

    if ( style ) {

        if (!(style instanceof Node))
            style = Object.assign(
                document.createElement('style'),  {textContent: style}
            );

        meta.push( decoratorOf(Component, 'style', style) );

        template.content.insertBefore(style, template.content.firstChild);
    }

    return template;
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
 * @return {function(elements: DecoratorDescriptor[]): Object} Component class decorator
 */
export function component(meta = { }) {

    var {template, style, data, tagName} = meta;

    return  ({elements}) => {

        const merged = (template || style)  &&
            define(elements, template, style);

        if ( data )  elements.push( decoratorOf(Component, 'data', data) );

        decoratorMix(elements, Component);

        decoratorMix(elements, Component.prototype);

        return {
            kind:  'class',
            elements,
            finisher(Class) {
                if (
                    merged  &&  self.ShadyCSS  &&
                    !(ShadyCSS.nativeCss && ShadyCSS.nativeShadow)
                )
                    ShadyCSS.prepareTemplate(merged, Class.tagName);

                self.customElements.define(
                    Class.tagName,  Class,  tagName && {extends: tagName}
                );
            }
        };
    };
}

export { Component };

export {default as InputComponent} from './component/InputComponent';

export * from './utility/object';

export * from './utility/DOM';

export * from './utility/resource';

export {default as Template} from './view/Template';

export {default as View} from './view/View';

export {default as ObjectView} from './view/ObjectView';

export {default as ArrayView} from './view/ArrayView';
