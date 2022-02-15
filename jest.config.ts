import { Config } from '@jest/types';

const options: Config.InitialOptions = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsconfig: 'test/tsconfig.json'
        }
    }
};
export default options;
