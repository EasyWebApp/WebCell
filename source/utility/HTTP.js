import { stringifyDOM, parseDOM } from 'dom-renderer';

import { $, documentTypeOf } from './DOM';

import { parseHash, parse, blobFrom, toDataURI, stringify } from './resource';


/**
 * @param {string|URL} URI - Full URL of a resource
 *
 * @return {boolean} Whether it's cross domain to current page
 */
export function isXDomain(URI) {

    return  ((new URL(URI, document.baseURI)).origin  !==  self.location.origin);
}


/**
 * @param {Element} form - `<form />` or `<fieldset />`
 *
 * @return {String|FormData|Object}
 */
export function serialize(form) {

    if ( $('input[type="file"][name]', form)[0] )  return new FormData( form );

    const data = Array.from(
        form.elements,  ({name, value}) => (name && [name, value])
    ).filter( Boolean );

    form = form.form || form;

    switch (form.getAttribute('enctype') || form.enctype) {
        case 'text/plain':
            return  data.map(([name, value]) => `${name}=${value}`).join('\n');
        case 'application/x-www-form-urlencoded':
            return  '' + new URLSearchParams( data );
        case 'application/json':
            return  Object.fromEntries( data );
    }
}


/**
 * Enhanced `fetch()` with **Progress handlers** based on `XMLHttpRequest()`
 *
 * @param {String|URL} URI
 *
 * @param {Object}        [request={ }]
 * @param {String}        [request.method='GET']
 * @param {String|Object} [request.body]
 * @param {Object}        [request.headers]
 * @param {Object}        [request.upload={ }]
 *     - [Event handlers of `XMLHttpRequestUpload()`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)
 * @param {...Object}     [request.extra]
 *     - [Writable properties of XHR object](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Properties)
 *
 * @return {Promise<XMLHttpRequest>} Resolved on `load` event or
 *                                   Rejected on `error` event
 */
export function fetch(
    URI,
    {method = 'GET', body, headers, upload = { }, ...extra}  =  { }
) {
    const XHR = new XMLHttpRequest();

    if ( extra )  Object.assign(XHR, extra);

    if ( upload )  Object.assign(XHR.upload, upload);

    XHR.open(method, URI);

    for (let key in headers)  XHR.setRequestHeader(key, headers[key]);

    return  new Promise((resolve, reject) => {

        XHR.onload = ({ target }) => resolve( target ),
        XHR.onerror = ({ target }) => reject( target );

        XHR.send( body );
    });
}


/**
 * Key for Header name, Value for Parser function
 *
 * @type {Object}
 *
 * @property {function(value: String): *} Link
 */
export const headerParser = {
    Link(value) {

        const link = { };

        value.replace(
            /<(\S+?)>; rel="(\w+)"(?:; title="(.*?)")?/g,
            (_, URI, rel, title)  =>  {

                link[rel] = { URI, rel };

                if (title != null)  link[rel].title = title;
            }
        );

        return link;
    }
};


/**
 * @param {String} raw
 *
 * @return {Object}
 */
export function parseHeader(raw) {

    return  parseHash(':',  '\r\n',  raw,  (key, value) => [
        key.replace(/^\w|-\w/g,  char => char.toUpperCase()),
        (headerParser[key] instanceof Function)  ?
            headerParser[key]( value )  :  value
    ]);
}


/**
 * @param {XMLHttpRequest} XHR
 *
 * @return {String|Document|DocumentFragment|Object|Blob}
 */
export function bodyOf(XHR) {

    const [scope, type] = (
        (XHR.getResponseHeader('Content-Type') || '').split(';')[0]  ||  ''
    ).split('/');

    switch ( type ) {
        case 'xml':
        case 'xhtml':
        case 'svg':
            return  XHR.responseXML;
        case 'html':
            return  parseDOM( XHR.responseText );
        case 'json':
            return  parse( XHR.responseText );
        default:
            return  (scope === 'text')  ?  XHR.responseText  :  (
                blobFrom( toDataURI( XHR.response ) )
            );
    }
}


/**
 * HTTP request
 *
 * @param {string}             URI            - HTTP URL
 * @param {string}             [method='GET']
 * @param {String|Object|Node} [body]         - Data to send
 * @param {Object}             [headers]
 * @param {Object}             [option]       - Parameters of {@link fetch} about `XMLHttpRequest()`
 *
 * @return {Object}
 * @property {Number} status  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * @property {Object} headers - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 * @property {*}      body    - {@link bodyOf}
 *
 * @throws {URIError} - `status` < 400
 */
export async function request(URI, method = 'GET', body, headers, option) {

    headers = headers || { };

    if (body instanceof Node)
        if (['form', 'fieldset'].includes( body.nodeName.toLowerCase() )) {

            body = serialize( body );

            headers['Content-Type'] =
                ((typeof body === 'string')  &&  body.includes('\n'))  ?
                    'text/plain' : 'application/x-www-form-urlencoded';
        } else {
            headers['Content-Type'] = documentTypeOf( body );

            body = stringifyDOM( body );
        }

    if ((body instanceof Object) && !(body instanceof FormData))  try {

        body = stringify( body.valueOf() );

        headers['Content-Type'] = headers['Content-Type'] || 'application/json';

    } catch (error) {/* eslint-disable-line */}

    const XHR = await fetch(
        URI,  Object.assign({method, headers, body}, option)
    );

    const response = {
        status:   XHR.status,
        headers:  parseHeader(XHR.getAllResponseHeaders() || ''),
        body:     bodyOf( XHR )
    };

    if (XHR.status < 400)  return response;

    throw Object.assign(new URIError( XHR.statusText ),  response);
}
