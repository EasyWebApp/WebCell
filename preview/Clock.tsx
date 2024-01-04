import { observable } from 'mobx';
import { Second } from 'web-utility';
import { component, observer } from '../source';

class ClockModel {
    @observable
    accessor time = new Date();

    constructor() {
        setInterval(() => (this.time = new Date()), Second);
    }
}

const clockStore = new ClockModel();

export const FunctionClock = observer(() => {
    const { time } = clockStore;

    return (
        <time dateTime={time.toJSON()}>
            Function Clock: {time.toLocaleString()}
        </time>
    );
});

@component({
    tagName: 'class-clock',
    mode: 'open'
})
@observer
export class ClassClock extends HTMLElement {
    state = new ClockModel();

    render() {
        const { time } = this.state;

        return (
            <time dateTime={time.toJSON()}>
                Class Clock: {time.toLocaleString()}
            </time>
        );
    }
}
