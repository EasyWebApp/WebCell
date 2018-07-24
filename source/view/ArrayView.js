import View from './View';

import ObjectView from './ObjectView';

const Array_iterator = [ ][Symbol.iterator], Array_indexOf = [ ].indexOf;


/**
 * View for Array model
 */
export default  class ArrayView extends View {
    /**
     * @param {Element} element
     * @param {View}    [parent]
     */
    constructor(element, parent) {

        if (! super(element,  'array',  [ ],  parent).booted) {

            this.template = element.innerHTML.trim();  this.clear();
        }
    }

    [Symbol.iterator]() {  return  Array_iterator.call( this );  }

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
                    this.template, this
                );

                data[ data.length ] = view.data;

                if (! (item.index != null))
                    Object.defineProperty(item, 'index', {
                        get:    function () {  return data.indexOf( this );  }
                    });

                return  view.render( item ).content;
            })
        ));

        return this;
    }

    push(... item) {  return  this.render( item ).length;  }

    indexOf(view, start) {  return  Array_indexOf.call(this, view, start);  }
}
