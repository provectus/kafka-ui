import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import SuspenseQueryComponent from 'components/common/SuspenseQueryComponent/SuspenseQueryComponent';

const fallback = 'fallback';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: () => <div>{fallback}</div>,
}));

describe('SuspenseQueryComponent', () => {
  const text = 'text';

  it('should render the inner component if no error occurs', () => {
    render(<SuspenseQueryComponent>{text}</SuspenseQueryComponent>);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('should not render the inner component and call navigate', () => {
    // throwing intentional For error boundaries to work
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const Component = () => {
      throw new Error('new Error');
    };

    render(
      <SuspenseQueryComponent>
        <Component />
      </SuspenseQueryComponent>
    );
    expect(screen.queryByText(text)).not.toBeInTheDocument();
    expect(screen.getByText(fallback)).toBeInTheDocument();
    jest.clearAllMocks();
  });
});
