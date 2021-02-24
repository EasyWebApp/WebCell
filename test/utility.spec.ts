import type { CSSStyles } from 'web-utility';

import { toCamelCase, toHyphenCase } from '../source/utility/data';
import { stringifyCSS } from '../source/utility/DOM';

describe('Utility methods', () => {
    it('should convert a Camel-case String to Hyphen-case', () => {
        expect(toHyphenCase('smallCamel')).toBe('small-camel');
        expect(toHyphenCase('LargeCamel')).toBe('large-camel');
    });

    it('should convert a Hyphen-case String to Camel-case', () => {
        expect(toCamelCase('small-camel')).toBe('smallCamel');
        expect(toCamelCase('large-camel', true)).toBe('LargeCamel');
    });

    describe('Stringify CSS', () => {
        const rule: CSSStyles = {
            position: 'absolute',
            top: '0',
            height: '100%',
            objectFit: 'contain'
        };

        it('should stringify Simple CSS Object to a Rule', () => {
            const CSS = stringifyCSS(rule);

            expect(CSS).toBe(`position: absolute;
top: 0;
height: 100%;
object-fit: contain;`);
        });

        it('should stringify Nested CSS Object to Rules', () => {
            const CSS = stringifyCSS({
                '.test': rule,
                '#demo': rule
            });

            expect(CSS).toBe(`.test {
    position: absolute;
    top: 0;
    height: 100%;
    object-fit: contain;
}
#demo {
    position: absolute;
    top: 0;
    height: 100%;
    object-fit: contain;
}`);
        });

        it('should stringify Nested CSS Object to Nested Rules', () => {
            const simple_rule = { '.test': rule };

            const CSS = stringifyCSS({
                ...simple_rule,
                '@media (min-width: 600px)': simple_rule
            });

            expect(CSS).toBe(`.test {
    position: absolute;
    top: 0;
    height: 100%;
    object-fit: contain;
}
@media (min-width: 600px) {
    .test {
        position: absolute;
        top: 0;
        height: 100%;
        object-fit: contain;
    }
}`);
        });
    });
});
