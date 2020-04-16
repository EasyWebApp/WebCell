import '../source/utility/polyfill';
import { stringifyCSS } from '../source';

describe('Utility methods', () => {
    describe('Stringify CSS', () => {
        const rule = {
            position: 'absolute',
            top: 0,
            height: '100%'
        };

        it('should stringify Simple CSS Object to a Rule', () => {
            const CSS = stringifyCSS(rule);

            expect(CSS).toBe(`position: absolute;
top: 0;
height: 100%;
`);
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
}
#demo {
    position: absolute;
    top: 0;
    height: 100%;
}
`);
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
}
@media (min-width: 600px) {
    .test {
        position: absolute;
        top: 0;
        height: 100%;
    }
}
`);
        });
    });
});
