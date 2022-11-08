import Input, { InputProps } from 'components/common/Input/Input';
import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';

const setupWrapper = (props?: Partial<InputProps>) => (
  <Input name="test" {...props} />
);
jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));

describe('Custom Input', () => {
  describe('with no icons', () => {
    const getInput = () => screen.getByRole('textbox');

    it('to be in the document', () => {
      render(setupWrapper());
      expect(getInput()).toBeInTheDocument();
    });
  });
  describe('number', () => {
    const getInput = () => screen.getByRole('spinbutton');

    it('allows user to type only numbers', async () => {
      render(setupWrapper({ type: 'number' }));
      const input = getInput();
      await userEvent.type(input, 'abc131');
      expect(input).toHaveValue(131);
    });

    it('allows negative values', async () => {
      render(setupWrapper({ type: 'number' }));
      const input = getInput();
      await userEvent.type(input, '-2');
      expect(input).toHaveValue(-2);
    });
  });
});
