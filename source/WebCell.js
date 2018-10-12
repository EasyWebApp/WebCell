import Component, { linkDataOf, attributeChanged } from './component/Component';

import { getPropertyDescriptor, decoratorOf } from './utility/object';

import { parseDOM } from './utility/DOM';

import { blobFrom } from './utility/resource';


/**
 * @typedef {Object} DecoratorDescriptor
 *
 * @property {String} kind       - `class`, `field` or `method`
 * @property {String} key        - Member name
 * @property {String} placement  - `static` or `prototype`
 * @property {Object} descriptor - Last parameter of `Object.defineProperty()`
 */


/**
 * Decorator for `observedAttributes()`
 *
 * @param {DecoratorDescriptor} meta
 */
export function mapProperty(meta) {

    const observer = meta.descriptor.get;

    meta.descriptor.get = function () {

        const onChange = getPropertyDescriptor(
            this.prototype, 'attributeChangedCallback'
        );

        if (! onChange)
            Object.defineProperty(this.prototype, 'attributeChangedCallback', {
                value:  attributeChanged
            });

        return  linkDataOf.call(this, observer.call( this ));
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


const skip_key = new Set(
    Object.getOwnPropertyNames( Function ).concat(
        Object.getOwnPropertyNames( Function.prototype )
    )
);

skip_key.delete('toString');

function decoratorMix(member, mixin) {

    const skip = mixin instanceof Function,
        property = Object.getOwnPropertyDescriptors( mixin );

    for (let key in property)
        if (!(skip  ?  skip_key.has( key )  :  (
            (key === 'constructor')  &&  (property[key].value instanceof Function)
        )))
            member.push(
                decoratorOf(mixin,  key,  property[key].value || property[key])
            );
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

        if ( template ) {

            if (!(template instanceof Node)) {

                template = parseDOM( (template + '').trim() );

                if (template.firstChild.tagName === 'TEMPLATE')
                    template = template.firstChild.content;
            }

            elements.push( decoratorOf(Component, 'template', template) );
        }

        if ( style )
            elements.push(decoratorOf(
                Component,
                'style',
                (style instanceof Node)  ?  style  :  Object.assign(
                    document.createElement('style'),  {textContent: style}
                )
            ));

        if ( data )  elements.push( decoratorOf(Component, 'data', data) );

        decoratorMix(elements, Component);

        decoratorMix(elements, Component.prototype);

        return {
            kind:  'class',
            elements,
            finisher(Class) {

                window.customElements.define(
                    Class.tagName,  Class,  tagName && {extends: tagName}
                );
            }
        };
    };
}

export { Component, attributeChanged };

export {default as InputComponent} from './component/InputComponent';

export * from './utility/object';

export * from './utility/DOM';

export * from './utility/resource';

export {default as Template} from './view/Template';

export {default as View} from './view/View';

export {default as ObjectView} from './view/ObjectView';

export {default as ArrayView} from './view/ArrayView';
