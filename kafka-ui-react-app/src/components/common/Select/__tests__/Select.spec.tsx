import Select, { SelectProps } from 'components/common/Select/Select';
import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));

const renderComponent = (props?: Partial<SelectProps>) =>
  render(<Select name="test" {...props} />);

describe('Custom Select', () => {
  describe('when non-live', () => {
    it('there is not live icon', () => {
      renderComponent({ isLive: false });
      expect(screen.queryByTestId('liveIcon')).not.toBeInTheDocument();
    });
  });

  describe('when live', () => {
    it('there is live icon', () => {
      renderComponent({ isLive: true });
      expect(screen.getByTestId('liveIcon')).toBeInTheDocument();
    });
  });
});
