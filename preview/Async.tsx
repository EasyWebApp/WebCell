import { FC, PropsWithChildren } from '../source';

const Async: FC<PropsWithChildren> = ({ children }) => (
    <div>Async load: {children}</div>
);
export default Async;
