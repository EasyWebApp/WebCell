import { stringifyDOM, parseDOM } from 'dom-renderer';

import { $ } from './DOM';

import { extend } from './object';


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

    if ((form.form || form).getAttribute('enctype')  !==  'application/json')
        return  '' + new URLSearchParams( data );

    form = { };

    data.forEach(([key, value])  =>  form[key] = value);

    return form;
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

    if ( extra )  extend(XHR, extra);

    if ( upload )  extend(XHR.upload, upload);

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
 * HTTP request
 *
 * @param {string}                URI            - HTTP URL
 * @param {string}                [method='GET']
 * @param {string|Object|Element} [body]         - Data to send
 * @param {Object}                [headers]
 * @param {Object}                [option]       - Parameters of {@link fetch} about `XMLHttpRequest()`
 *
 * @return {string|Object|DocumentFragment|Blob} Parse response data automatically
 */
export async function request(URI, method = 'GET', body, headers, option) {

    if (body instanceof Element)  body = serialize( body );

    if (body instanceof Object)  try {

        body = stringify( body.valueOf() );

        headers = headers || { };

        headers['Content-Type'] = headers['Content-Type'] || 'application/json';

    } catch (error) {/* eslint-disable-line */}

    const XHR = await fetch(
        URI,  Object.assign({method, headers, body}, option)
    );

    const type = XHR.getResponseHeader('Content-Type').split(';')[0];

    switch ( type ) {
        case 'application/xml':
        case 'image/svg':
            return  XHR.responseXML;
        case 'text/html':
            return  parseDOM( XHR.responseText );
        case 'application/json':
            return  parse( XHR.responseText );
        default:
            return  (type.split('/')[0] === 'text')  ?  XHR.responseText  :  (
                blobFrom( toDataURI( XHR.response ) )
            );
    }
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
