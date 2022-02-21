import { observable } from 'mobx';

import { WebCell } from './WebCell';
import { WebField } from './WebField';
/**
 * @deprecated Renamed to `WebCell` since WebCell 3.0.0
 */
export const mixin = WebCell;
/**
 * @deprecated Renamed to `WebField` since WebCell 3.0.0
 */
export const mixinForm = WebField;
/**
 * @deprecated Use `@observable` of MobX directly since WebCell 3.0.0
 */
export const watch = observable;

export * from './utility';
export * from './renderer';
export * from './decorator';
export * from './WebCell';
export * from './WebField';
export * from './Async';
