import Input, { InputProps } from 'components/common/Input/Input';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import React from 'react';
import { render } from 'lib/testHelpers';

const setupWrapper = (props?: Partial<InputProps>) => (
  <ThemeProvider theme={theme}>
    <Input name="test" {...props} />
  </ThemeProvider>
);
jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));
describe('Custom Input', () => {
  describe('with no icons', () => {
    it('matches the snapshot', () => {
      const component = render(setupWrapper());
      expect(component.baseElement).toMatchSnapshot();
    });
  });

  describe('with icons', () => {
    it('matches the snapshot', () => {
      const component = render(
        setupWrapper({
          leftIcon: 'fas fa-address-book',
          rightIcon: 'fas fa-address-book',
        })
      );
      expect(component.baseElement).toMatchSnapshot();
    });
  });
});
