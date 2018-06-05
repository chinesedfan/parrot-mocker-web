module.exports = {
    coveragePathIgnorePatterns: [
        '<rootDir>/common/cookies.js',
        '<rootDir>/server/lib/node-fetch.js'
    ],
    testMatch: [
        '<rootDir>/test/*.test.js'
    ],
    testEnvironment: 'node'
};
