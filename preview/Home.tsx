import { formToJSON } from 'web-utility';

import { AnimateCSS, FC, lazy, WebCellProps } from '../source';
import { ClassClock, FunctionClock } from './Clock';
import { TestField } from './Field';

const Async = lazy(() => import('./Async'));

const Hello: FC<WebCellProps> = ({ className, children }) => (
    <h1 className={className}>Hello {children}!</h1>
);

export const HomePage = () => (
    <>
        <AnimateCSS
            type="fadeIn"
            component={props => <Hello {...props}>WebCell</Hello>}
        />
        <div>
            We use the same configuration as Parcel to bundle this sandbox, you
            can find more info about Parcel
            <a
                href="https://parceljs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
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

        <form
            onSubmit={({ currentTarget }) =>
                alert(JSON.stringify(formToJSON(currentTarget)))
            }
        >
            <TestField name="test" />

            <button>√</button>
        </form>

        <Async>content</Async>
    </>
);
