import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import ConfigListItem, {
  ListItemProps,
} from 'components/Topics/Topic/Details/Settings/ConfigListItem';

const setupComponent = (props: ListItemProps) => {
  render(
    <table>
      <tbody>
        <ConfigListItem {...props} />
      </tbody>
    </table>
  );
};

const getName = () => screen.getByText('someName');
const getValue = () => screen.getByText('someValue');

it('renders with CustomValue', () => {
  setupComponent({
    config: {
      name: 'someName',
      value: 'someValue',
      defaultValue: 'someDefaultValue',
    },
  });
  expect(getName()).toBeInTheDocument();
  expect(getName()).toHaveStyle('font-weight: 500');
  expect(getValue()).toBeInTheDocument();
  expect(getValue()).toHaveStyle('font-weight: 500');
  expect(screen.getByText('someDefaultValue')).toBeInTheDocument();
});

it('renders without CustomValue', () => {
  setupComponent({
    config: { name: 'someName', value: 'someValue', defaultValue: 'someValue' },
  });
  expect(getName()).toBeInTheDocument();
  expect(getName()).toHaveStyle('font-weight: 400');
  expect(getValue()).toBeInTheDocument();
  expect(getValue()).toHaveStyle('font-weight: 400');
  expect(screen.getByTitle('Default Value')).toHaveTextContent('');
});
