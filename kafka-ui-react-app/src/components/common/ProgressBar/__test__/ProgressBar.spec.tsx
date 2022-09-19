import React from 'react';
import { render } from 'lib/testHelpers';
import ProgressBar from 'components/common/ProgressBar/ProgressBar';
import { screen } from '@testing-library/dom';

describe('Progressbar', () => {
  const itRendersCorrectPercentage = (completed: number, expected: number) => {
    it('renders correct percentage', () => {
      render(<ProgressBar completed={completed} />);
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveStyleRule('width', `${expected}%`);
    });
  };

  [
    [-143, 0],
    [0, 0],
    [67, 67],
    [143, 100],
  ].forEach(([completed, expected]) =>
    itRendersCorrectPercentage(completed, expected)
  );
});
