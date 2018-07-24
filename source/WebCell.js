import Component from './Component';

export {Component};

export {default as View} from './view/View';

export {default as ObjectView} from './view/ObjectView';

export {default as ArrayView} from './view/ArrayView';


/**
 * Equivalent to the integration of Array's map() & filter() methods
 *
 * @param {Iterable}                                           list
 * @param {function(item: *, index: number, list:Iterable): *} filter
 *     - Return `item` itself to reserve, `undefined` or `null` to ignore, or Array to merge in.
 *
 * @return {Array}
 */
export function multipleMap(list, filter) {

    const result = [ ];  filter = (filter instanceof Function)  &&  filter;

    for (let i = 0;  i < list.length;  i++) {

        let item = filter  ?  filter(list[i], i, list)  :  list[i];

        if (item != null)
            if (item instanceof Array)
                result.push(...item);
            else
                result.push( item );
    }

    return result;
}


/**
 * Merge own properties of two or more objects together into the first object
 * by their descriptor
 *
 * @param {Object}    target - An object that will receive the new properties
 *                             if `source` are passed in
 * @param {...Object} source - Additional objects containing properties to merge in
 *
 * @return {Object} The `target` parameter
 */
export function extend(target, ...source) {

    for (let object of source)  if (object instanceof Object) {

        let descriptor = Object.getOwnPropertyDescriptors( object );

        if (object instanceof Function) {

            delete descriptor.name;
            delete descriptor.length;
            delete descriptor.prototype;

            let prototype = Object.getOwnPropertyDescriptors( object.prototype );

            delete prototype.constructor;

            Object.defineProperties(target.prototype, prototype);
        }

        Object.defineProperties(target, descriptor);
    }

    return target;
}


var depth = 0;

/**
 * Traverse Object-tree & return Node array through the filter
 *
 * @param {object}        node     - Object tree
 * @param {string}        fork_key - Key of children list
 * @param {MapTreeFilter} filter   - Map filter
 *
 * @return {Array}  Result list of Map filter
 */
export function mapTree(node, fork_key, filter) {

    var children = node[fork_key], list = [ ];    depth++ ;

    for (var i = 0, value;  i < children.length;  i++) {
        /**
         * @typedef {function} MapTreeFilter
         *
         * @param {object} child
         * @param {number} index
         * @param {number} depth
         *
         * @return {?object}  `Null` or `Undefined` to **Skip the Sub-Tree**,
         *                    and Any other Type to Add into the Result Array.
         */
        try {
            value = filter.call(node, children[i], i, depth);

        } catch (error) {

            depth = 0;    throw error;
        }

        if (! (value != null))  continue;

        list.push( value );

        if ((children[i] != null)  &&  (children[i][fork_key] || '')[0])
            list.push.apply(
                list,  mapTree(children[i], fork_key, filter)
            );
    }

    depth-- ;

    return list;
}


/**
 * @return {boolean} Whether current script is running in a sub DOM
 */
export function inSubDOM() {

    return  (document.currentScript || '').ownerDocument  !==  document;
}


/**
 * @return {boolean} Whether current script is in `<head />` of a DOM
 */
export function inHead() {

    const script = document.currentScript || '';

    const DOM = script.ownerDocument;

    return  DOM  &&  (script.parentNode === DOM.head);
}


/**
 * Register a component
 *
 * @param {function} subClass
 *
 * @return {function} `subClass`
 */
export function component(subClass) {

    const static_member = { };

    if (inSubDOM()  ||  (! inHead())) {

        let { template } = Component.findTemplate();

        Object.defineProperty(static_member,  'template',  {
            get:         () => template,
            enumerable:  true
        });
    }

    extend(subClass,  Component,  static_member);

    customElements.define(subClass.tagName, subClass);

    return subClass;
}
