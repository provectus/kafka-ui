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

it('renders with CustomValue', () => {
  setupComponent({
    config: {
      name: 'someName',
      value: 'someValue',
      defaultValue: 'someDefaultValue',
    },
  });
  expect(screen.getByText('someName')).toBeInTheDocument();
  expect(screen.getByText('someName')).toHaveStyle('font-weight: 500');
  expect(screen.getByText('someValue')).toBeInTheDocument();
  expect(screen.getByText('someValue')).toHaveStyle('font-weight: 500');
  expect(screen.getByText('someDefaultValue')).toBeInTheDocument();
});

it('renders without CustomValue', () => {
  setupComponent({
    config: { name: 'someName', value: 'someValue', defaultValue: 'someValue' },
  });
  expect(screen.getByText('someName')).toBeInTheDocument();
  expect(screen.getByText('someName')).toHaveStyle('font-weight: 400');
  expect(screen.getByText('someValue')).toBeInTheDocument();
  expect(screen.getByText('someValue')).toHaveStyle('font-weight: 400');
  expect(screen.getByTitle('Default Value')).toHaveTextContent('');
});
