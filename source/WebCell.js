import Component, { linkDataOf, attributeChanged } from './component/Component';

import { getPropertyDescriptor, decoratorOf } from './utility/object';

import { stringifyDOM, parseDOM } from './utility/DOM';

import { blobFrom } from './utility/resource';


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
        Object.getOwnPropertyNames(() => { })
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

                if (merged  &&  !(ShadyCSS.nativeCss && ShadyCSS.nativeShadow))
                    ShadyCSS.prepareTemplate(merged, Class.tagName);

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
