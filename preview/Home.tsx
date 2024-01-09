import { formToJSON } from 'web-utility';
import { FC, PropsWithChildren } from '../source';

import { ClassClock, FunctionClock } from './Clock';
import { TestField } from './Field';

const Hello: FC<PropsWithChildren> = ({ children }) => (
    <h1>Hello {children}!</h1>
);

export const HomePage = () => (
    <>
        <Hello>WebCell</Hello>
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
            // @ts-ignore
            onSubmit={({ currentTarget }) =>
                alert(JSON.stringify(formToJSON(currentTarget)))
            }
        >
            <TestField name="test" />

            <button>√</button>
        </form>
    </>
);
