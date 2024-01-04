import { ClassClock, FunctionClock } from './Clock';

export const HomePage = () => (
    <>
        <h1>Hello Vanilla!</h1>
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
    </>
);
