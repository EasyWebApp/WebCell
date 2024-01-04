import { DOMRenderer } from 'dom-renderer';
import { configure } from 'mobx';

import { HomePage } from './Home';

configure({ enforceActions: 'never' });

new DOMRenderer().render(<HomePage />, document.querySelector('#app')!);
