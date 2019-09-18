import { init } from 'snabbdom';
import PropsHelper from 'snabbdom/modules/props';
import ClassHelper from 'snabbdom/modules/class';
import StyleHelper from 'snabbdom/modules/style';
import EventHelper from 'snabbdom/modules/eventlisteners';

export const patch = init([PropsHelper, ClassHelper, StyleHelper, EventHelper]);

export type PlainObject = { [key: string]: any };

export function fromEntries(list: (string | any)[][]) {
    return list.reduce(
        (object, [key, value]) => ((object[key] = value), object),
        {} as PlainObject
    );
}
