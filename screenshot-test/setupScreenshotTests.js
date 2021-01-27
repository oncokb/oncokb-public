import { toMatchImageSnapshot, configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { setDefaultOptions } from 'jsdom-screenshot';

setDefaultOptions({
  launch: { args: ['--no-sandbox'] }
});

jest.setTimeout(15000);

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  failureThreshold: 0.02,
  failureThresholdType: 'percent'
});

expect.extend({ toMatchImageSnapshot });