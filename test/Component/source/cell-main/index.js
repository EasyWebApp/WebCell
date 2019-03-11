import { component } from 'web-cell';


@component({
    template:  '<cell-page />',
    store:     {test: 'example'}
})
export default  class CellMain extends HTMLElement {

    constructor() {  super().construct();  }
}
