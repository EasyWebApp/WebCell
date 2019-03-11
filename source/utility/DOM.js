import { parseDOM, walkDOM } from 'dom-renderer';

import { likeArray } from './object';

import { clearPath } from './resource';


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
 * @param {Node}    node
 * @param {Boolean} [inNodes] - Seek in all kinds of `Node`
 *
 * @return {Number} The index of `node` in its siblings
 */
export function indexOf(node, inNodes) {

    var key = `previous${inNodes ? '' : 'Element'}Sibling`,  index = 0;

    while (node = node[key])  index++;

    return index;
}


/**
 * @param {Node[]} list
 * @param {Number} [index]
 *
 * @return {Number}
 */
export function insertableIndexOf(list, index) {

    return  (!(index != null) || (index > list.length))  ?
        list.length  :  (
            (index < 0)  ?  (list.length + index)  :  index
        );
}


/**
 * @param {ParentNode}  parent
 * @param {Node|String} child      - https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/append#Parameters
 * @param {Number|Node} [position]
 * @param {Boolean}     [inNodes]  - Seek in all kinds of `Node`
 */
export function insertTo(parent, child, position, inNodes) {

    const list = Array.from( parent[`child${inNodes ? 'Nodes' : 'ren'}`] );

    if (position instanceof Node)
        position = indexOf(position, inNodes);
    else
        position = insertableIndexOf(list, position);

    const point = list.slice( position )[0];

    if ( point )
        point.before( child );
    else
        parent.append( child );
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
