import { component, InputComponent, on, classNameOf } from 'web-cell';


@component({
    template:  `
        <input type="\${view.type}" value="\${view.value}"
            readOnly="\${view.readOnly}" disabled="\${view.disabled}"
            placeholder="\${view.placeholder}">
        <slot></slot>`
})
export class CellInput extends InputComponent {

    constructor() {  super();  }

    viewUpdateCallback(newData) {

        if (newData.value === 'wrong') {

            console.error('Something goes wrong!');

            return false;
        }
    }

    @on('test',  ':host input')
    onTest(event, that, {example}) {

        event.preventDefault();

        console.info(classNameOf( event ),  that.tagName,  example);
    }
}
