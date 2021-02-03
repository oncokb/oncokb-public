import { toMatchImageSnapshot, configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { setDefaultOptions } from 'jsdom-screenshot';

jest.setTimeout(15000);

setDefaultOptions({
  launch: { args: ['--no-sandbox'] }
});

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customSnapshotsDir: './screenshot-test/__baseline_snapshots__',
  customDiffDir: './screenshot-test/__diff_output__'
});

expect.extend({ toMatchImageSnapshot });