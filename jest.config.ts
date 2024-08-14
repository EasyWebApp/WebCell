import { JestConfigWithTsJest } from 'ts-jest';

const options: JestConfigWithTsJest = {
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    transform: {
        '.+\\.spec\\.tsx?$': ['ts-jest', { tsconfig: 'test/tsconfig.json' }]
    }
};
export default options;
