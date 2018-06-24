module.exports = {
    globals: {
        retryLimit: 3,
        host: 'parrotmocker.now.sh',
        fullHost: 'https://parrotmocker.now.sh'
    },
    globalSetup: './test/setup.js',
    setupTestFrameworkScriptFile: './test/setupTestFramework.js',
    coveragePathIgnorePatterns: [
        '<rootDir>/common/cookie.js',
        '<rootDir>/server/lib/node-fetch.js'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/test/setup*.js'
    ],
    testMatch: [
        '<rootDir>/test/**/*.test.js'
    ],
    testEnvironment: 'node'
};
