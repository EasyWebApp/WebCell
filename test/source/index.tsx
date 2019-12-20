import { documentReady, render, createCell, Fragment } from '../../source';

import { SubTag } from './SubTag';
import { TestTag } from './TestTag';
import { ToggleTag } from './ToggleTag';

documentReady.then(() =>
    render(
        <Fragment>
            <SubTag />
            <TestTag />
            <ToggleTag />
        </Fragment>
    )
);
