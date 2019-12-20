import {
    component,
    mixin,
    watch,
    createCell,
    TransitionCell
} from '../../source';

import style from './ToggleTag.module.less';

@component({
    tagName: 'toggle-tag',
    renderTarget: 'children'
})
export class ToggleTag extends mixin() {
    @watch
    active = true;

    render() {
        return (
            <TransitionCell
                className={style['toggle-tag']}
                activeClass={this.active ? style['show'] : ''}
            >
                Fade in/out
            </TransitionCell>
        );
    }
}
