import { arrayLike } from '../utility/object';

import View from './View';

import ObjectView from './ObjectView';

const Array_indexOf = [ ].indexOf;


@arrayLike
/**
 * View for Array model
 */
export default  class ArrayView extends View {
    /**
     * @param {Element} element
     * @param {View}    [parent]
     */
    constructor(element, parent) {

        super(element,  'array',  [ ],  parent);

        if ( this.booted )  return;

        const template = element.children[0];

        this.template = (template.tagName.toLowerCase() === 'template')  ?
            template.content  :  element.innerHTML;

        this.clear();
    }

    clear() {

        Array.prototype.splice.call(this, 0, Infinity);

        this.content.innerHTML = '';

        return this;
    }

    valueOf() {  return  Array.from(this,  view => view.valueOf());  }

    /**
     * @protected
     *
     * @return {ArrayView}
     */
    update() {

        for (let view of this)  view.render();

        return this;
    }

    /**
     * @param {Iterable} [list]
     *
     * @return {ArrayView}
     */
    render(list) {

        if (! list)  return this.update();

        const data = this.data;

        this.content.append(... [ ].concat(
            ... Array.from(list,  item => {

                const view = this[ this.length++ ] = new ObjectView(
                    this.template.cloneNode( true ),  this
                );

                data[ data.length ] = view.data;

                if (! (item.index != null))
                    Object.defineProperty(item, 'index', {
                        get:         function () {

                            return  data.indexOf( this );
                        },
                        enumerable:  true
                    });

                return  view.render( item ).content;
            })
        ));

        return this;
    }

    push(... item) {  return  this.render( item ).length;  }

    indexOf(view, start) {  return  Array_indexOf.call(this, view, start);  }
}
