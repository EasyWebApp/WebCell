import { extend } from './object';

import { $, parseDOM } from './DOM';


/**
 * @param {string|URL} URI - Full URL of a resource
 *
 * @return {boolean} Whether it's cross domain to current page
 */
export function isXDomain(URI) {

    return (
        (new URL(URI, window.location.href)).origin  !==  window.location.origin
    );
}

/**
 * @param {Element} form - `<form />` or `<fieldset />`
 *
 * @return {String|FormData|Object}
 */
export function serialize(form) {

    if ( $('input[type="file"][name]', form)[0] )  return new FormData( form );

    const data = Array.from(
        form.elements,
        field  =>  (field.name && [field.name, field.value])
    ).filter( Boolean );

    if (
        (form.form || form).getAttribute('enctype') !== 'application/json'
    )
        return  '' + new URLSearchParams( data );

    form = { };

    for (let [key, value]  of  data)  form[key] = value;

    return form;
}

/**
 * HTTP request
 *
 * @param {string}                URI            - HTTP URL
 * @param {string}                [method='GET']
 * @param {string|Object|Element} [body]         - Data to send
 * @param {Object}                [headers]
 * @param {Object}                [option]       - https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
 *
 * @return {string|Object|DocumentFragment|Blob} Parse response data automatically
 */
export async function request(URI, method = 'GET', body, headers, option) {

    if (body instanceof Element)  body = serialize( body );

    if (body instanceof Object)  try {

        body = JSON.stringify( body.valueOf() );

        headers = headers || { };

        headers['Content-Type'] = headers['Content-Type'] || 'application/json';

    } catch (error) {/* eslint-disable-line */}

    const response = await window.fetch(URI, extend(
        {
            method,  headers,  body,
            mode:         isXDomain( URI ) ? 'cors' : 'same-origin',
            credentials:  'same-origin'
        },
        option
    ));

    const type = response.headers.get('Content-Type').split(';')[0];

    switch ( type ) {
        case 'text/html':
            return  parseDOM(await response.text());
        case 'application/json':
            return  await response.json();
        default:
            return  await response[
                (type.split('/')[0] === 'text')  ?  'text'  :  'blob'
            ]();
    }
}

/**
 * @param {String} URI - Returned by `URL.createObjectURL()`
 *
 * @return {Promise<Blob>}
 */
export function blobOf(URI) {

    const XHR = new XMLHttpRequest();

    XHR.responseType = 'blob';

    XHR.open('GET', URI);

    return  new Promise((resolve, reject) => {

        XHR.onload = () => resolve( XHR.response );

        XHR.onerror = reject;

        XHR.send();
    });
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

    data = base64  ?  window.atob( data )  :  data;

    const aBuffer = new ArrayBuffer( data.length );

    const uBuffer = new Uint8Array( aBuffer );

    for (let i = 0;  data[i];  i++)  uBuffer[i] = data.charCodeAt( i );

    return new Blob([aBuffer],  { type });
}
