import { component, InputComponent } from 'web-cell';


@component({
    template:  `
        <input type="\${view.type}" value="\${view.value}"
            readOnly="\${view.readOnly}" disabled="\${view.disabled}"
            placeholder="\${view.placeholder}">
        <slot></slot>`
})
export class CellInput extends InputComponent {

    constructor() {  super();  }
}
