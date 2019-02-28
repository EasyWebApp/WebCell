import { component, mapProperty, mapData, on, indexOf } from 'web-cell';


@component({
    template: `
        <textarea onchange="\${host.trigger.bind( host )}">
            Hello, \${view.name}!
        </textarea>`,
    style: `
        textarea {
            font-style: italic;
        }`,
    data: {
        name:  'Web components'
    }
})
export class CellTest extends HTMLElement {

    constructor() {  super().construct();  }

    @mapProperty
    static get observedAttributes() {  return ['value', 'name'];  }

    @mapData
    attributeChangedCallback() { }

    get value() {  return this.$('textarea')[0].value;  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }

    @on('input', ':host textarea')
    testInput(event) {

        const innerTarget = event.composedPath()[0];

        console.info(
            event.target.tagName,
            innerTarget.tagName,
            indexOf( innerTarget )
        );
    }
}
