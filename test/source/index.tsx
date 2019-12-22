import { documentReady, render, createCell, Fragment } from '../../source';

import { SubTag } from './SubTag';
import { TestTag } from './TestTag';

documentReady.then(() =>
    render(
        <Fragment>
            <SubTag />
            <TestTag />
        </Fragment>
    )
);
