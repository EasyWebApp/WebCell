import { DOMRenderer } from 'dom-renderer';
import { configure } from 'mobx';

import { HomePage } from './Home';
import { renderMode } from './utility';

configure({ enforceActions: 'never' });

new DOMRenderer().render(
    <HomePage />,
    document.querySelector('#app')!,
    renderMode
);
