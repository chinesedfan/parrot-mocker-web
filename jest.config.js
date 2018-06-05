module.exports = {
    coveragePathIgnorePatterns: [
        '<rootDir>/common/cookie.js',
        '<rootDir>/server/lib/node-fetch.js'
    ],
    testMatch: [
        '<rootDir>/test/*.test.js'
    ],
    testEnvironment: 'node'
};
