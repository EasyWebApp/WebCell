import { configure, observable } from 'mobx';
import { component, observer } from '../source';

configure({ enforceActions: 'never' });

@component({ tagName: 'home-page' })
@observer
export class HomePage extends HTMLElement {
    @observable
    accessor time = '';

    connectedCallback() {
        setInterval(() => (this.time = new Date().toLocaleString()), 1000);
    }

    render() {
        const { time } = this;

        return (
            <>
                <h1>Hello Vanilla!</h1>
                <div>
                    We use the same configuration as Parcel to bundle this
                    sandbox, you can find more info about Parcel
                    <a
                        href="https://parceljs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        here
                    </a>
                    .
                </div>
                <time>{time}</time>
            </>
        );
    }
}
