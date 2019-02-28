import { stringifyDOM, parseDOM } from 'dom-renderer';

import { $, documentTypeOf } from './DOM';


/**
 * @param {String} raw
 *
 * @return {Number} Length in Half-width characters
 */
export function byteLength(raw) {

    return  raw.replace(/[^\u0021-\u007e\uff61-\uffef]/g, 'xx').length;
}


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
 * @param {Object} data
 *
 * @return {String} JSON source code
 */
export function stringify(data) {

    return  JSON.stringify(data,  (key, value) => {

        if (value instanceof Node)  return stringifyDOM( value );

        return value;
    }, 4);
}


/**
 * @param {String} raw - JSON source code
 *
 * @return {Object}
 */
export function parse(raw) {

    return  JSON.parse(raw,  (key, value) => {

        if (/^\d{4}(-\d{2}){2}T\d{2}(:\d{2}){2}\.\d{3}Z$/.test( value ))
            return  new Date( value );

        if (/<[\w-][\s\S]*?>/.test( value )) {

            const node = parseDOM( value );

            return  (node.childNodes.length < 2)  ?  node.firstChild  :  node;
        }

        return value;
    });
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
 * @param {String} raw - Binary data
 *
 * @return {String} Base64 encoded data
 */
export function encodeBase64(raw) {

    return self.btoa(
        encodeURIComponent( raw ).replace(
            /%([0-9A-F]{2})/g,  (_, p1) => String.fromCharCode('0x' + p1)
        )
    );
}


/**
 * @param {String} raw - Base64 encoded data
 *
 * @return {String} Binary data
 */
export function decodeBase64(raw) {

    return decodeURIComponent(
        self.atob( raw ).split('').map(
            char  =>  '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
    );
}


/**
 * @param {String} raw       - Binary data
 * @param {String} [type=''] - MIME type
 *
 * @return {String}
 */
export function toDataURI(raw, type = '') {

    return  `data:${type};base64,${encodeBase64( raw )}`;
}


/**
 * @param {String} URI - Returned by `URL.createObjectURL()`
 *
 * @return {Promise<Blob>}
 */
export  async function blobOf(URI) {

    return  (await fetch(URI, {responseType: 'blob'})).response;
}


const schema_type = /^(?:(\w+):)?.+?(?:\.(\w+))?$/,
    DataURI = /^data:(.+?\/(.+?))?(;base64)?,(\S+)/;

/**
 * @param {String} URI - HTTP(S) URL, Data URI or Object URL
 *
 * @return   {Object}
 * @property {String} schema - URI schema (`http`, `https`, `data` or `blob`)
 * @property {String} type   - File type (same as the Extension name of a file)
 */
export async function fileTypeOf(URI) {

    const [_, schema, type] = schema_type.exec( URI )  ||  [ ];  // eslint-disable-line

    switch ( schema ) {
        case 'data':  return {
            schema: 'data',  type: DataURI.exec( URI )[2]
        };
        case 'blob':  {
            const blob = await blobOf( URI );

            return  {schema: 'blob',  type: blob.type};
        }
        default:      return {schema, type};
    }
}


/**
 * @param {String} URI - Data URI
 *
 * @return {Blob}
 */
export function blobFrom(URI) {

    var [_, type, __, base64, data] = DataURI.exec( URI )  ||  [ ];  // eslint-disable-line

    data = base64  ?  self.atob( data )  :  data;

    const aBuffer = new ArrayBuffer( data.length );

    const uBuffer = new Uint8Array( aBuffer );

    for (let i = 0;  data[i];  i++)  uBuffer[i] = data.charCodeAt( i );

    return new Blob([aBuffer],  { type });
}


/**
 * @param {String} raw
 *
 * @return {Object}
 */
export function parseHeader(raw) {

    return  Object.fromEntries(raw.split( /\r\n/ ).map(item => {

        item = item.split(':');

        return  [item.shift(), item.join(':')];
    }));
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


/**
 * @param {File}   file
 * @param {String} [type='DataURL']   - https://developer.mozilla.org/en-US/docs/Web/API/FileReader#Methods
 * @param {String} [encoding='UTF-8'] - https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText#Parameters
 *
 * @return {String|ArrayBuffer}
 */
export function readAs(file, type = 'DataURL', encoding = 'UTF-8') {

    const reader = new FileReader();

    return  new Promise((resolve, reject) => {

        reader.onload = () => resolve( reader.result );

        reader.onerror = reject;

        reader[`readAs${type}`](file, encoding);
    });
}
