import { Template } from 'dom-renderer';

import { $ } from './DOM';


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
 * DOM event delegate
 *
 * @param {String}       selector
 * @param {EventHandler} handler
 *
 * @return {Function} Handler wrapper
 */
export function delegate(selector, handler) {

    return  function (event) {

        var path = event.composedPath(), node;

        while ((node = path.shift())  &&  (node !== event.currentTarget))
            if (node.matches  &&  node.matches( selector ))
                return  handler.call(node, event, node, event.detail);
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
 * @param {number} [second=0]
 *
 * @return {Promise} Wait seconds in Macro tasks
 */
export function delay(second) {

    return  new Promise(resolve  =>  setTimeout(resolve, (second || 0) * 1000));
}
