import { IReactionPublic, observable } from 'mobx';
import { CustomElement, Second } from 'web-utility';
import { attribute, component, observer, on, reaction } from '../source';

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
export class ClassClock extends HTMLElement implements CustomElement {
    @attribute
    @observable
    accessor time = new Date();

    timer = setInterval(() => (this.time = new Date()), Second);

    disconnectedCallback() {
        clearInterval(this.timer);
    }

    @reaction((that: ClassClock) => that.time)
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
