import { Config } from '@jest/types';

const options: Config.InitialOptions = {
    testEnvironment: 'jsdom',
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

export default options;
