import { formToJSON, sleep } from 'web-utility';

import { AnimateCSS, FC, lazy, observer, PropsWithChildren, WebCellProps } from '../source';
import { ClassClock, FunctionClock } from './Clock';
import { TestField } from './Field';

const Async = lazy(() => import('./Async'));

const Hello: FC<WebCellProps> = ({ className, children }) => (
    <h1 className={className}>Hello {children}!</h1>
);

const AsyncComponent = observer(async ({ children }: PropsWithChildren) => {
    await sleep(1);

    return <p>Async Component: {children}</p>;
});

export const HomePage = () => (
    <>
        <AnimateCSS type="fadeIn" component={props => <Hello {...props}>WebCell</Hello>} />
        <div>
            We use the same configuration as Parcel to bundle this sandbox, you can find more info
            about Parcel
            <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">
                here
            </a>
            .
        </div>

        <ul>
            <li>
                <FunctionClock />
            </li>
            <li>
                <ClassClock />
            </li>
        </ul>

        <form onSubmit={({ currentTarget }) => alert(JSON.stringify(formToJSON(currentTarget)))}>
            <TestField name="test" />

            <button>√</button>
        </form>

        <Async>content</Async>
        <AsyncComponent>content</AsyncComponent>
    </>
);
