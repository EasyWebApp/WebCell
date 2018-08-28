import { extend } from './object';

import { parseDOM } from './DOM';


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
 * HTTP request
 *
 * @param {string} URI
 * @param {string} [method='GET']
 * @param {*}      [body]
 * @param {Object} [headers]
 * @param {Object} [option]
 *
 * @return {*} Parse response data automatically
 */
export async function request(URI, method = 'GET', body, headers, option) {

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
