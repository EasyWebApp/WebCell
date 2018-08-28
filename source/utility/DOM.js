/**
 * @private
 *
 * @return {boolean} Whether current script is running in a sub DOM
 */
export function inSubDOM() {

    return  (document.currentScript || '').ownerDocument  !==  document;
}


/**
 * @private
 *
 * @return {boolean} Whether current script is in `<head />` of a DOM
 */
export function inHead() {

    const script = document.currentScript || '';

    const DOM = script.ownerDocument;

    return  DOM  &&  (script.parentNode === DOM.head);
}


/**
 * @param {string} markup - Code of an markup fragment
 *
 * @return {DocumentFragment}
 */
export function parseDOM(markup) {

    markup = (new DOMParser()).parseFromString(markup, 'text/html');

    const fragment = document.createDocumentFragment();

    fragment.append(
        ... Array.from( markup.head.childNodes ).concat(
            Array.from( markup.body.childNodes )
        )
    );

    return fragment;
}


/**
 * @param {Element|Element[]|DocumentFragment} tree
 *
 * @return {string} HTML/XML source code
 */
export function stringifyDOM(tree) {

    return  (tree.nodeType === 1)  ?
        tree.outerHTML  :  Array.from(tree.childNodes || tree,  node => {

            switch ( node.nodeType ) {
                case 1:    return node.outerHTML;
                case 3:    return node.nodeValue;
            }
        }).join('');
}


/**
 * @param {number} [second=0]
 *
 * @return {Promise} Wait seconds in Macro tasks
 */
export function delay(second) {

    return  new Promise(resolve  =>  setTimeout(resolve, (second || 0) * 1000));
}


var tick;
/**
 * @return {Promise<number>} [Time stamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp)
 */
export function nextTick() {

    return  tick || (
        tick = new Promise(
            resolve => window.requestAnimationFrame(
                time  =>  (tick = null, resolve( time ))
            )
        )
    );
}
