import { component } from 'web-cell';


@component({ store: {test: 'example'} })
export default  class CellMain extends HTMLElement {

    constructor() {  super().construct();  }
}
