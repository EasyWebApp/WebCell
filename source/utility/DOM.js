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


const TableWrapper = {
        before:  '<table>',
        after:   '</table>',
        depth:   2
    },
    RowWrapper = {
        before:  '<table><tr>',
        depth:   3
    },
    SelectWrapper = {
        before:  '<select multiple>'
    };

const TagWrapper = {
    area:      {before: '<map>'},
    legend:    {before: '<fieldset>'},
    param:     {before: '<object>'},
    caption:   TableWrapper,
    thead:     TableWrapper,
    tbody:     TableWrapper,
    tfoot:     TableWrapper,
    tr:        TableWrapper,
    th:        RowWrapper,
    td:        RowWrapper,
    optgroup:  SelectWrapper,
    option:    SelectWrapper
};

/**
 * @param {String}                           markup
 * @param {function(markup: String): Node[]} parser
 *
 * @return {Node[]}
 */
function safeWrap(markup, parser) {

    var wrapper;

    markup = parser(
        markup.replace(/<(\w+)[\s\S]*?>[\s\S]*?<\/\1>/,  (match, tagName) => {

            wrapper = TagWrapper[ tagName ];

            return  wrapper ?
                (wrapper.before + match + (wrapper.after || ''))  :  match;
        })
    );

    const depth = (wrapper || '').depth;

    for (let i = 0;  i < depth;  i++)  markup = [ markup[0].firstElementChild ];

    return markup;
}


/**
 * @param {string} markup - Code of an markup fragment
 *
 * @return {DocumentFragment}
 */
export function parseDOM(markup) {

    const fragment = document.createDocumentFragment();

    fragment.append(... safeWrap(markup,  markup => {

        markup = (new DOMParser()).parseFromString(markup, 'text/html');

        return  [... markup.head.childNodes].concat([... markup.body.childNodes]);
    }));

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
