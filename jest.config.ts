import { Config } from '@jest/types';

const options: Config.InitialOptions = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    transform: {
        '.+\\.spec\\.tsx?$': ['ts-jest', { tsconfig: 'test/tsconfig.json' }]
    }
};
export default options;
