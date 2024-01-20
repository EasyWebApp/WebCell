import { IReactionPublic, observable } from 'mobx';
import { Second } from 'web-utility';
import {
    WebCell,
    attribute,
    component,
    observer,
    on,
    reaction
} from '../source';

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

export interface ClassClock extends WebCell {}

@component({
    tagName: 'class-clock',
    mode: 'open'
})
@observer
export class ClassClock extends HTMLElement implements WebCell {
    @attribute
    @observable
    accessor time = new Date();

    private timer: number;

    connectedCallback() {
        this.timer = setInterval(() => (this.time = new Date()), Second);
    }

    disconnectedCallback() {
        clearInterval(this.timer);
    }

    @reaction(({ time }) => time)
    handleReaction(newValue: Date, oldValue: Date, reaction: IReactionPublic) {
        console.log(newValue, oldValue, reaction);
    }

    @on('click', 'time')
    handleClick(event: MouseEvent, currentTarget: HTMLTimeElement) {
        console.log(event, currentTarget);
    }

    render() {
        const { time } = this;

        return (
            <time dateTime={time.toJSON()}>
                Class Clock: {time.toLocaleString()}
            </time>
        );
    }
}
