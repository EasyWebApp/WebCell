import './polyfill';
import { stringifyCSS, createI18nScope } from '../dist';

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

    describe('Internationalization', () => {
        enum en_US {
            title = 'Test'
        }
        enum zh_CN {
            title = '测试'
        }
        enum zh_TW {
            title = '測試'
        }

        it('should return Text of Matched Language', async () => {
            const { loaded, i18nTextOf } = createI18nScope<typeof zh_CN>(
                {
                    'en-US': async () => en_US,
                    'zh-CN': async () => zh_CN
                },
                'zh-CN'
            );

            await loaded;

            expect(i18nTextOf('title')).toBe(en_US.title);
        });

        it('should return Text of Default Language', async () => {
            const { loaded, i18nTextOf } = createI18nScope<typeof zh_CN>(
                {
                    'zh-TW': async () => zh_TW,
                    'zh-CN': async () => zh_CN
                },
                'zh-CN'
            );

            await loaded;

            expect(i18nTextOf('title')).toBe(zh_CN.title);
        });
    });
});
