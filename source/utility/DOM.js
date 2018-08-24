
/**
 * @return {boolean} Whether current script is running in a sub DOM
 */
export function inSubDOM() {

    return  (document.currentScript || '').ownerDocument  !==  document;
}


/**
 * @return {boolean} Whether current script is in `<head />` of a DOM
 */
export function inHead() {

    const script = document.currentScript || '';

    const DOM = script.ownerDocument;

    return  DOM  &&  (script.parentNode === DOM.head);
}
