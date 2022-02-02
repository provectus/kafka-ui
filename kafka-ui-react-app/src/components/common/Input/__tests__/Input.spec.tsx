import Input, { InputProps } from 'components/common/Input/Input';
import React from 'react';
import { render } from 'lib/testHelpers';

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
