import Input, { InputProps } from 'components/common/Input/Input';
import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';

// Mock useFormContext
let component: HTMLInputElement;

const setupWrapper = (props?: Partial<InputProps>) => (
  <Input name="test" {...props} />
);
jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),

    // Mock methods.getValues and methods.setValue
    getValues: jest.fn(() => {
      return component.value;
    }),
    setValue: jest.fn((key, val) => {
      component.value = val;
    }),
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
    const getInput = () => screen.getByRole<HTMLInputElement>('spinbutton');

    describe('input', () => {
      it('allows user to type numbers only', async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.type(input, 'abc131');
        expect(input).toHaveValue(131);
      });

      it('allows user to type negative values', async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '-2');
        expect(input).toHaveValue(-2);
      });

      it('allows user to type positive values only', async () => {
        render(setupWrapper({ type: 'number', positiveOnly: true }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '-2');
        expect(input).toHaveValue(2);
      });

      it('allows user to type decimal', async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '2.3');
        expect(input).toHaveValue(2.3);
      });

      it('allows user to type integer only', async () => {
        render(setupWrapper({ type: 'number', integerOnly: true }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '2.3');
        expect(input).toHaveValue(23);
      });

      it("not allow '-' appear at any position of the string except the start", async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '2-3');
        expect(input).toHaveValue(23);
      });

      it("not allow '.' appear at the start of the string", async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '.33');
        expect(input).toHaveValue(33);
      });

      it("not allow '.' appear twice in the string", async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.type(input, '3.3.3');
        expect(input).toHaveValue(3.33);
      });
    });

    describe('paste', () => {
      it('allows user to paste numbers only', async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('abc131');
        expect(input).toHaveValue(131);
      });

      it('allows user to paste negative values', async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('-2');
        expect(input).toHaveValue(-2);
      });

      it('allows user to paste positive values only', async () => {
        render(setupWrapper({ type: 'number', positiveOnly: true }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('-2');
        expect(input).toHaveValue(2);
      });

      it('allows user to paste decimal', async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('2.3');
        expect(input).toHaveValue(2.3);
      });

      it('allows user to paste integer only', async () => {
        render(setupWrapper({ type: 'number', integerOnly: true }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('2.3');
        expect(input).toHaveValue(23);
      });

      it("not allow '-' appear at any position of the pasted string except the start", async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('2-3');
        expect(input).toHaveValue(23);
      });

      it("not allow '.' appear at the start of the pasted string", async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('.33');
        expect(input).toHaveValue(0.33);
      });

      it("not allow '.' appear twice in the pasted string", async () => {
        render(setupWrapper({ type: 'number' }));
        const input = getInput();
        component = input;
        await userEvent.click(input);
        await userEvent.paste('3.3.3');
        expect(input).toHaveValue(3.33);
      });
    });
  });
});
