import Component, { linkDataOf, attributeChanged } from './component/Component';

import { getPropertyDescriptor, decoratorOf } from './utility/object';

import { parseDOM } from './utility/DOM';


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


const skip_key = {
    name:       1,
    length:     1,
    prototype:  1,
    caller:     1,
    arguments:  1,
    call:       1,
    apply:      1,
    bind:       1
};

function decoratorMix(member, mixin) {

    const skip = mixin instanceof Function,
        property = Object.getOwnPropertyDescriptors( mixin );

    for (let key in property)
        if (!(skip  ?  (key in skip_key)  :  (
            (key === 'constructor')  &&  (property[key].value instanceof Function)
        )))
            member.push(
                decoratorOf(mixin,  key,  property[key].value || property[key])
            );
}


/**
 * Register a component
 *
 * @param {Object}         option
 * @param {String|Node}    [option.template] - HTML template source or sub DOM tree
 * @param {String|Element} [option.style]    - CSS source or `<style />`
 * @param {Object}         [option.data]     - Initial data
 * @param {String}         [option.tagName]  - Name of an HTML original tag to extend
 *
 * @return {function(elements: DecoratorDescriptor[]): Object} Component class decorator
 */
export function component({template, style, data, tagName}) {

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
