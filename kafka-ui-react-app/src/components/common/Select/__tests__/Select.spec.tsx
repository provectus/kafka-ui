import Select, { SelectProps } from 'components/common/Select/Select';
import React from 'react';
import { render } from 'lib/testHelpers';

jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));

const setupWrapper = (props?: Partial<SelectProps>) => (
  <Select name="test" {...props} />
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
