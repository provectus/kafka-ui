import Select, { SelectProps } from 'components/common/Select/Select';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));

const setupWrapper = (props?: Partial<SelectProps>) => (
  <ThemeProvider theme={theme}>
    <Select name="test" {...props} />
  </ThemeProvider>
);

describe('Custom Select', () => {
  describe('when non-live', () => {
    it('matches the snapshot', () => {
      const component = render(setupWrapper());
      expect(component.baseElement).toMatchSnapshot();
    });
  });

  describe('when live', () => {
    it('matches the snapshot', () => {
      const component = render(
        setupWrapper({
          isLive: true,
        })
      );
      expect(component.baseElement).toMatchSnapshot();
    });
  });
});
