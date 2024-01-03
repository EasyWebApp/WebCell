import { DOMRenderer } from 'dom-renderer';

import { HomePage } from './Home';

new DOMRenderer().render(<HomePage />, document.querySelector('#app')!);
