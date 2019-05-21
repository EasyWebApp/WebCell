import { walkDOM } from 'dom-renderer';

import { clearPath } from './resource';


/**
 * jQuery-like selector
 *
 * @param {string}                            selector
 * @param {Element|Document|DocumentFragment} [context=document]
 *
 * @return {Element[]}
 */
export function $(selector, context = document) {

    return  Array.from( context.querySelectorAll( selector ) );
}


const type_map = {
    html:   'text/html',
    xhtml:  'application/xhtml',
    xml:    'application/xml',
    svg:    'image/svg'
};

/**
 * @param {Node} node
 *
 * @return {?String} https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_Types
 */
export function documentTypeOf(node) {

    if ((node instanceof Document) || (node instanceof DocumentFragment))
        node = node.firstElementChild;

    if (node instanceof Element) {

        const type = node.namespaceURI.split('/').slice(-1)[0];

        return  type_map[type] || type;
    }

    if (node instanceof Node)
        return  documentTypeOf(node.parentNode || node.ownerDocument);
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
 * @param {String|URL} URI
 * @param {?Boolean}   ESM
 *
 * @return {Promise<Event>}
 */
export function loadModule(URI, ESM) {

    return  new Promise((onload, onerror) => {

        const script = Object.assign(document.createElement('script'), {
            onload, onerror
        });

        if ( ESM )  script.type = 'module';

        script.src = clearPath( URI );

        document.head.append( script );
    });
}


const { pathname } = self.location,
    ESM = (! document.querySelector(
        'script[src$="custom-elements-es5-adapter.js"]'
    ));

/**
 * @param {Node}   tree
 * @param {String} [base] - Base path after `location.pathname`
 *
 * @return {Node} The `tree`
 */
export async function loadDOM(tree, base) {

    const task = [ ];

    Array.from(walkDOM(tree, null, true),  ({ tagName }) => {

        tagName = (tagName || '').toLowerCase();

        if (
            /^\w+-\w+$/.test( tagName )  &&
            !self.customElements.get( tagName )
        )
            task.push(loadModule(
                `${pathname}/${base}/${tagName}.js`, ESM
            ));
    });

    await Promise.all( task );

    return tree;
}
