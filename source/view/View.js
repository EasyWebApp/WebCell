import { parseDOM, stringifyDOM } from '../utility/DOM';

const view_DOM = new WeakMap(), DOM_view = new WeakMap();

const view_data = new WeakMap(), view_parent = new WeakMap();


/**
 * Abstract View
 */
export default  class View {
    /**
     * @param {string|Element|DocumentFragment} template
     * @param {string}                          nameKey  - Key (littleCamelCase) of HTML `data-*`
     *                                                     to get name of bound data
     * @param {Object}                          data     - Empty Model for this view
     * @param {View}                            [parent] - Parent view in the DOM tree
     */
    constructor(template, nameKey, data, parent) {

        if (this.constructor === View)
            throw TypeError('"View" is an abstract class');

        switch ( template.nodeType ) {
            case 1:
                this.name = template.dataset[ nameKey ];  break;
            case 11:
                if (! (template.parentNode || template.host))
                    template = [... template.childNodes];
                break;
            default:
                template = [
                    ... document.importNode(parseDOM( template ),  true).childNodes
                ];
        }

        var _this_ = this.bindWith( template );

        if (_this_ !== this) {

            _this_.booted = true;

            return _this_;
        }

        view_data.set(this, data),  view_parent.set(this, parent);
    }

    /**
     * @protected
     *
     * @param {Element|Element[]|DocumentFragment} template
     *
     * @return {View} This view or the view bound before
     */
    bindWith(template) {

        var _this_;

        if (template instanceof Array)
            template = template.filter(node => {

                switch ( node.nodeType ) {
                    case 1:
                        if (! (_this_ = DOM_view.get( node )))
                            DOM_view.set(node, this);
                        break;
                    case 3:
                        if (! node.nodeValue.trim())  return;
                }

                return true;
            });
        else if (! (_this_ = DOM_view.get( template )))
            DOM_view.set(template, this);

        view_DOM.set(this, template);

        return  _this_ || this;
    }

    /**
     * @param {Element|DocumentFragment} node
     *
     * @return {View} View instance bound with `node`
     */
    static instanceOf(node) {  return  DOM_view.get( node );  }

    /**
     * @type {Element|Element[]|DocumentFragment}
     */
    get content() {  return  view_DOM.get( this );  }

    /**
     * @return {string} Full markup code of this view
     */
    toString() {  return stringifyDOM( this.content );  }

    /**
     * @protected
     *
     * @type {Object}
     */
    get data() {  return  view_data.get( this );  }

    /**
     * Parent view in current DOM tree
     *
     * @type {?View}
     */
    get parent() {

        var view = view_parent.get( this );

        if (view instanceof View)  return view;

        var node = this.content[0] || this.content;

        while (node = node.parentNode)
            if (view = View.instanceOf( node ))
                return  view_parent.set(this, view)  &&  view;
    }

    /**
     * @protected
     *
     * @type {?Object}
     */
    get scope() {  return  (this.parent || '').data;  }

    /**
     * Host element of a view in a Shadow DOM tree
     *
     * @type {?Element}
     */
    get rootHost() {

        var view = this;

        while ( view.parent )  view = view.parent;

        return view.content.host;
    }

    /**
     * Get original data of this view
     *
     * @abstract
     *
     * @return {Object}
     */
    valueOf() {

        throw TypeError('View.prototype.valueOf() must be overwriten');
    }

    /**
     * Render this view with data or Update without data
     *
     * @abstract
     *
     * @return {View}
     */
    render() {

        throw TypeError('View.prototype.render() must be overwriten');
    }

    /**
     * Reset this view to empty data
     *
     * @abstract
     *
     * @return {View}
     */
    clear() {

        throw TypeError('View.prototype.clear() must be overwriten');
    }
}
