import { Template, parseDOM } from 'dom-renderer';

import { likeArray } from './object';


/**
 * @type {Promise}
 */
export const documentReady = new Promise(resolve => {

    document.addEventListener('DOMContentLoaded', resolve);

    self.addEventListener('load', resolve);

    (function check() {

        (document.readyState === 'complete')  ?
            resolve()  :  setTimeout( check );
    })();
});


/**
 * jQuery-like selector
 *
 * @param {string}                            selector
 * @param {Element|Document|DocumentFragment} [context=document]
 *
 * @return {Element[]}
 */
export function $(selector, context) {

    return  Array.from( (context || document).querySelectorAll( selector ) );
}


/**
 * @param {string}                    selector    - CSS selector
 * @param {Node}                      context
 * @param {function(parent: Node): *} [condition]
 *
 * @return {?Node} Matched parent
 */
export function $up(selector, context, condition) {

    condition = (condition instanceof Function)  &&  condition;

    while (context = context.parentNode)
        if ( condition ) {

            let result = condition( context );

            if ( result )
                return  (result === true)  ?  context  :  result;

        } else if (context.matches  &&  context.matches( selector ))
            return context;
}


function mediaLoad(media, condition) {

    return  new Promise((resolve, reject) => {

        if ( condition() )
            resolve();
        else
            media.onload = resolve,
            media.onerror = reject;
    });
}

/**
 * @param {Element|Document} [context]
 *
 * @return {Promise} Resolved when all media elements in `context` are loaded
 */
export function mediaReady(context) {

    return Promise.all($(
        'img[src], iframe[src], audio[src], video[src]',  context
    ).map(media => {

        if (Template.Expression.test( media.getAttribute('src') ))  return;

        switch ( media.tagName.toLowerCase() ) {
            case 'img':
                return  mediaLoad(media, () => media.complete);
            case 'iframe':
                return  new Promise((resolve, reject) => {
                    try {
                        if (media.contentDocument.readyState === 'complete')
                            resolve();
                        else
                            media.onload = resolve,
                            media.onerror = reject;

                    } catch (error) {  resolve();  }
                });
            case 'audio':
            case 'video':
                return  mediaLoad(media, () => (media.readyState > 0));
        }
    }));
}


/**
 * @param {Element} element
 *
 * @return {number} The index of `element` in its siblings
 */
export function indexOf(element) {

    var index = 0;

    while (element = element.previousElementSibling)  index++;

    return index;
}


/**
 * @param {Event} event
 *
 * @return {Element} The target of `event` object (**Shadow DOM** is in account)
 */
export function targetOf(event) {

    const target = event.composedPath ? event.composedPath() : event.path;

    return  (target || '')[0]  ||  event.target;
}


/**
 * DOM event delegate
 *
 * @param {string}          selector
 * @param {DOMEventHandler} handler
 *
 * @return {Function} Handler wrapper
 */
export function delegate(selector, handler) {

    return  function (event) {

        var target = targetOf( event );

        if (! target.matches( selector ))
            target = $up(selector, target);

        if ( target )
            return  handler.call(target, event, target, event.detail);
    };
}


/**
 * @param {Element}      element
 * @param {String|Event} event
 * @param {?*}           detail     - Additional data
 * @param {?Boolean}     bubbles
 * @param {?Boolean}     cancelable
 * @param {?Boolean}     composed   - Whether the event will cross
 *                                    from the shadow DOM into the standard DOM
 *                                    after reaching the shadow root
 * @return {Boolean} Event be canceled or not
 */
export function trigger(element, event, detail, bubbles, cancelable, composed) {

    return element.dispatchEvent(
        (event instanceof Event)  ?
            new event.constructor(event.type, {
                bubbles:     event.bubbles,
                cancelable:  event.cancelable
            }) :
            new CustomEvent(event, {
                bubbles, cancelable, composed, detail
            })
    );
}


/**
 * @param {String|Node[]} fragment
 *
 * @return {?DocumentFragment}
 */
export function makeNode(fragment) {

    if (fragment instanceof Node)  return fragment;

    if (! likeArray( fragment ))  return parseDOM( fragment );

    let node = document.createDocumentFragment();

    node.append.apply(
        node,
        Array.from(
            fragment,  item => item.parentNode ? item.cloneNode(true) : item
        )
    );

    return node;
}


/**
 * @param {*} DOM
 *
 * @return {Boolean}
 */
export function isHTML(DOM) {

    return  (DOM instanceof HTMLDocument)  ||
        (DOM instanceof DocumentFragment)  ||
        (DOM instanceof HTMLElement);
}


const sandbox = document.createElement('div');

/**
 * @param {String} source - Markup source code
 *
 * @return {String} Special characters are tranformed to Markup entries
 */
export function encodeMarkup(source) {

    sandbox.textContent = source;

    return sandbox.innerHTML;
}

/**
 * @param {String} source
 *
 * @return {String} Markup entries are tranformed back to Special characters or
 *                  Escape Markup tags
 */
export function decodeMarkup(source) {

    sandbox.innerHTML = source;

    return sandbox.textContent;
}


/**
 * @typedef {Function} AttributeWatcher
 *
 * @param {string}  name
 * @param {?string} oldValue
 * @param {?string} newValue
 */

/**
 * @param {Element}          element
 * @param {string[]}         names
 * @param {AttributeWatcher} callback
 *
 * @return {MutationObserver}
 */
export function watchAttributes(element, names, callback) {

    const observer = new MutationObserver(list =>
        list.forEach(({ attributeName, oldValue }) => callback.call(
            this,
            attributeName,
            oldValue,
            element.getAttribute( attributeName )
        ))
    );

    observer.observe(element, {
        attributes:         true,
        attributeOldValue:  true,
        attributeFilter:    names
    });

    Array.from(
        element.attributes,
        ({ name, value })  =>  callback.call(this, name, null, value)
    );

    return observer;
}


/**
 * @param {number} [second=0]
 *
 * @return {Promise} Wait seconds in Macro tasks
 */
export function delay(second) {

    return  new Promise(resolve  =>  setTimeout(resolve, (second || 0) * 1000));
}
