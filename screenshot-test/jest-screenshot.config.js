module.exports = {
    verbose: true,
    preset: 'jest-puppeteer',
    setupFilesAfterEnv: ['./setupScreenshotTests.js'],
    transform: {
      '^.+\\.[t|j]sx?$': 'ts-jest',
    },
    testMatch: ["**/?(*.)+(screenshot).[jt]s?(x)"],
  };