import View from './View';

import Template from './Template';

import { nextTick } from '../utility/DOM';

import { mapTree, extend } from '../utility/object';

import ArrayView from './ArrayView';

const Array_iterator = [ ][Symbol.iterator],
    template_element = new WeakMap(),
    view_buffer = new WeakMap();


/**
 * View for Object model
 */
export default  class ObjectView extends View {
    /**
     * @param {string|Element|DocumentFragment} template
     * @param {View}                            [parent]
     */
    constructor(template, parent) {

        if (! super(template,  'object',  { },  parent).booted)
            this.length = 0, this.scan();
    }

    [Symbol.iterator]() {  return  Array_iterator.call( this );  }

    valueOf() {

        const data = Object.assign({ },  this.data);

        for (let template of this)
            if (template instanceof View)
                data[ template.name ] = template.valueOf();

        return data;
    }

    /**
     * @private
     *
     * @param {Node|Attr} node
     * @param {function}  renderer
     *
     * @return {Template}
     */
    static templateOf(node, renderer) {

        return  new Template(
            node.value || node.nodeValue,  ['view', 'scope', 'host'],  renderer
        );
    }

    /**
     * Async render
     *
     * @protected
     *
     * @param {string} key
     * @param {*}      value
     */
    async commit(key, value) {

        var buffer;

        if (! (buffer = view_buffer.get( this )))
            view_buffer.set(this,  buffer = { });

        buffer[key] = value;

        await nextTick();

        if (! view_buffer.get( this ))  return;

        this.render( buffer );

        view_buffer.delete( this );
    }

    /**
     * Add a watched property to this view instance
     *
     * @param {string} key
     * @param {*}      [value]
     *
     * @return {ObjectView} This view
     */
    watch(key, value) {

        if (!(key in this))
            Object.defineProperty(this,  key,  value ? {
                value:       value,
                enumerable:  true
            } : {
                get:         ()  =>  this.data[ key ],
                set:         (value)  =>  this.commit(key, value),
                enumerable:  true
            });
        else if (key  in  Object.getPrototypeOf( this ))
            console.warn(`Don't overwrite Inset property "${key}" !`);

        return this;
    }

    /**
     * @private
     *
     * @param {Element}  element
     * @param {Template} template
     */
    addTemplate(element, template) {

        if (! template[0])  return;

        template_element.set(this[ this.length++ ] = template,  element);

        for (let key of template.reference.get('view'))  this.watch( key );
    }

    /**
     * @private
     *
     * @param {string} name
     * @param {View}   view
     */
    addView(name, view) {  this.watch(name, view)[ this.length++ ] = view;  }

    /**
     * @private
     *
     * @param {Element} element
     */
    parseTag(element) {

        for (let attr  of  [... element.attributes]) {

            let name = attr.name;

            let template = ObjectView.templateOf(
                attr,
                (name in element)  ?
                    (value  =>  element[ name ] = value)  :
                    (value  =>  element.setAttribute(name, value))
            );

            if (template == '')  element.removeAttribute( name );

            this.addTemplate(element, template);
        }
    }

    /**
     * @private
     */
    scan() {

        var root = this.content;

        root = root.parentNode ? root : {
            childNodes:    (root instanceof Array)  ?  root  :  [ root ]
        };

        for (let { node }  of  mapTree(root, 'childNodes'))
            switch ( node.nodeType ) {
                case 1:
                    if ( node.dataset.object )
                        this.addView(node.dataset.object,  new ObjectView( node ));
                    else if ( node.dataset.array )
                        this.addView(node.dataset.array,  new ArrayView( node ));
                    else
                        this.parseTag( node );
                    break;
                case 3:  {
                    const template = ObjectView.templateOf(
                            node,  value => node.nodeValue = value
                        ),
                        element = node.parentNode;

                    if (! element.innerHTML.trim())
                        template.onChange = value => element.innerHTML = value;

                    this.addTemplate(element, template);
                }
            }
    }

    /**
     * First ancestor scope which isn't `Array`
     *
     * @protected
     *
     * @type {?Object}
     */
    get scope() {

        var view = this;

        while (view = view.parent)
            if (! (view instanceof ArrayView))  return view.data;
    }

    /**
     * @param {Object} [data]
     *
     * @return {ObjectView}
     */
    render(data) {

        const _data_ = extend(this.data, data);

        for (let key in data)  this.watch( key );

        for (let template of this) {

            let name = template.name;

            if (template instanceof Template)
                template.evaluate(
                    template_element.get( template ),  _data_,  this.scope,  this.rootHost
                );
            else if (template instanceof View)
                _data_[name] = template.render( data[ name ] ).data;
        }

        return this;
    }

    clear() {

        for (let template of this)  template.clear();

        return this;
    }
}
