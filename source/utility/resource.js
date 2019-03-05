import { stringifyDOM, parseDOM } from 'dom-renderer';

import { fetch } from './HTTP';


/**
 * @param {String} raw
 *
 * @return {Number} Length in Half-width characters
 */
export function byteLength(raw) {

    return  raw.replace(/[^\u0021-\u007e\uff61-\uffef]/g, 'xx').length;
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
 * @param {String}                                      keyChar
 * @param {String}                                      valueChar
 * @param {String}                                      raw
 * @param {function(key: String, value: String): Array} [mapper]
 *
 * @return {Object}
 */
export function parseHash(keyChar, valueChar, raw, mapper) {

    const data = { };  mapper = (mapper instanceof Function) && mapper;

    raw.split( valueChar ).forEach(item => {

        item = item.split( keyChar );

        var key = item[0].trim(),
            value = item.slice(1).join( keyChar ).trim();

        if (!key && !value)  return;

        try {  value = parse( value );  } catch (error) {/**/}

        if ( mapper )  [key, value] = mapper(key, value);

        if (data[key] != null) {

            if (!(data[key] instanceof Array))  data[key] = [ data[key] ];

            data[key].push( value );
        } else
            data[key] = value;
    });

    return data;
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
