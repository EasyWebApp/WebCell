import { component, mapProperty, mapData, targetOf, indexOf } from 'web-cell';


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

    constructor() {

        super().buildDOM();
    }

    @mapProperty
    static get observedAttributes() {  return ['value', 'name'];  }

    @mapData
    attributeChangedCallback() { }

    get value() {  return this.$('textarea')[0].value;  }

    set value(raw) {  this.$('textarea')[0].value = raw;  }

    testInput(event) {

        const innerTarget = targetOf( event );

        console.info(
            event.target.tagName,
            innerTarget.tagName,
            indexOf( innerTarget )
        );
    }
}
