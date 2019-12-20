import './DOM-polyfill';
import { createI18nScope } from '../source';

describe('Utility methods', () => {
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
