import { component, targetOf, indexOf } from 'web-cell';


@component({
    template: `
        <textarea onchange="\${host.bubbleOut.bind( host )}">
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

        super();

        this.buildDOM();
    }

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
