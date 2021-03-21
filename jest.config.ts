import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest/presets/js-with-ts',
    globals: {
        'ts-jest': {
            tsconfig: 'test/tsconfig.json',
            isolatedModules: true
        }
    },
    testPathIgnorePatterns: ['/node_modules/', '/MobX/'],
    transformIgnorePatterns: []
};

export default config;
