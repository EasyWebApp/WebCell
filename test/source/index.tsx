import {
    setI18n,
    documentReady,
    render,
    createCell,
    Fragment
} from '../../source';

import { SubTag } from './SubTag';
import { TestTag } from './TestTag';

Promise.all([
    setI18n({ 'zh-CN': () => import('./i18n/zh-CN.json') }),
    documentReady
]).then(() =>
    render(
        <Fragment>
            <SubTag />
            <TestTag />
        </Fragment>
    )
);
