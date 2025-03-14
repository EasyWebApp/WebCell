import { IReactionPublic, observable } from 'mobx';
import { Second } from 'web-utility';

import {
    attribute,
    component,
    observer,
    on,
    reaction,
    WebCell
} from '../source';
import { renderMode } from './utility';

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
    mode: 'open',
    renderMode
})
@observer
export class ClassClock extends HTMLElement implements WebCell {
    @attribute
    @observable
    accessor time = new Date();

    private timer: number;

    connectedCallback() {
        this.timer = window.setInterval(() => (this.time = new Date()), Second);
    }

    disconnectedCallback() {
        clearInterval(this.timer);
    }

    @reaction(({ time }) => time)
    handleReaction(newValue: Date, oldValue: Date, reaction: IReactionPublic) {
        console.info(newValue, oldValue, reaction);
    }

    @on('click', 'time')
    handleClick(event: MouseEvent, currentTarget: HTMLTimeElement) {
        console.info(event, currentTarget);
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
