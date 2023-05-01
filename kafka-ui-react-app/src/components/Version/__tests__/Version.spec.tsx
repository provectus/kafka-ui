import React from 'react';
import { screen } from '@testing-library/dom';
import Version from 'components/Version/Version';
import { render } from 'lib/testHelpers';
import { useLatestVersion } from 'lib/hooks/api/latestVersion';
import {
  deprecatedVersionPayload,
  latestVersionPayload,
} from 'lib/fixtures/latestVersion';

jest.mock('lib/hooks/api/latestVersion', () => ({
  useLatestVersion: jest.fn(),
}));
describe('Version Component', () => {
  const commitId = '96a577a';

  describe('render latest version', () => {
    beforeEach(() => {
      (useLatestVersion as jest.Mock).mockImplementation(() => ({
        data: latestVersionPayload,
      }));
    });
    it('renders latest release version as current version', async () => {
      render(<Version />);
      expect(screen.getByText(commitId)).toBeInTheDocument();
    });

    it('should not show warning icon if it is last release', async () => {
      render(<Version />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  it('show warning icon if it is not last release', async () => {
    (useLatestVersion as jest.Mock).mockImplementation(() => ({
      data: deprecatedVersionPayload,
    }));
    render(<Version />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
