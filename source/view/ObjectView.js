import View from './View';

import { mapTree, extend } from '../utility/object';

import Template from './Template';

import ArrayView from './ArrayView';

const Array_iterator = [ ][Symbol.iterator], template_element = new WeakMap();


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
     * Add a watched property to this view instance
     *
     * @param {string} key
     * @param {*}      [value]
     *
     * @return {ObjectView} This view
     */
    watch(key, value) {

        if (key in this) {

            if (key  in  Object.getPrototypeOf( this ))
                console.warn(`Don't overwrite Inset property "${key}" !`);
        } else
            Object.defineProperty(this,  key,  value ? {
                value:       value,
                enumerable:  true
            } : {
                get:    ()  =>  this.data[ key ],
                set:    (value)  =>  this.render({[key]: value})
            });

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

        for (let attr  of  Array.from( element.attributes )) {

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

        mapTree(root,  'childNodes',  (node) => {

            switch ( node.nodeType ) {
                case 1:
                    if ( node.dataset.object )
                        this.addView(node.dataset.object,  new ObjectView( node ));
                    else if ( node.dataset.array )
                        this.addView(node.dataset.array,  new ArrayView( node ));
                    else
                        this.parseTag( node );
                    break;
                case 3:
                    this.addTemplate(
                        node,
                        ObjectView.templateOf(
                            node,  value => node.nodeValue = value
                        )
                    );
            }

            return node;
        });
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
