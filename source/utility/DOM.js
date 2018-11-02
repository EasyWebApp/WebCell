import Template from '../view/Template';


/**
 * @type {Promise}
 */
export const documentReady = new Promise(resolve => {

    document.addEventListener('DOMContentLoaded', resolve);

    window.addEventListener('load', resolve);

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

    return  [... (context || document).querySelectorAll( selector )];
}


/**
 * @param {string} selector - CSS selector
 * @param {Node}   context
 *
 * @return {?Element} Matched parent
 */
export function $up(selector, context) {

    while ( context.parentNode ) {

        context = context.parentNode;

        if (context.matches  &&  context.matches( selector ))
            return context;
    }
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
 * @private
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

        if ( target )  return handler.call(target, event);
    };
}


/**
 * @param {Element}  element
 * @param {String}   type
 * @param {?*}       detail     - Additional data
 * @param {?Boolean} bubbles
 * @param {?Boolean} cancelable
 * @param {?Boolean} composed   - Whether the event will cross
 *                                from the shadow DOM into the standard DOM
 *                                after reaching the shadow root
 * @return {Boolean} Event be canceled or not
 */
export function trigger(element, type, detail, bubbles, cancelable, composed) {

    return  element.dispatchEvent(new CustomEvent(type, {
        bubbles, cancelable, composed, detail
    }));
}


/**
 * @param {string} markup - Code of an markup fragment
 *
 * @return {DocumentFragment}
 */
export function parseDOM(markup) {

    const box = document.createElement('template');

    box.innerHTML = markup;

    return box.content;
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

    const observer = new MutationObserver(list => {

        for (let mutation of list)
            callback.call(
                this,
                mutation.attributeName,
                mutation.oldValue,
                element.getAttribute( mutation.attributeName )
            );
    });

    observer.observe(element, {
        attributes:         true,
        attributeOldValue:  true,
        attributeFilter:    names
    });

    for (let attribute of element.attributes)
        callback.call(this, attribute.name, null, attribute.value);

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
