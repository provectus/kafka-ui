import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import Tooltip from 'components/common/Tooltip/Tooltip';
import userEvent from '@testing-library/user-event';

describe('Tooltip', () => {
  const tooltipText = 'tooltip';
  const tooltipContent = 'tooltip_Content';

  const setUpComponent = () =>
    render(<Tooltip value={tooltipText} content={tooltipContent} />);

  it('should render the tooltip element with its value text', () => {
    setUpComponent();
    expect(screen.getByText(tooltipText)).toBeInTheDocument();
  });

  it('should render the tooltip with default closed', () => {
    setUpComponent();
    expect(screen.queryByText(tooltipContent)).not.toBeInTheDocument();
  });

  it('should render the tooltip with and open during hover', async () => {
    setUpComponent();
    await userEvent.hover(screen.getByText(tooltipText));
    expect(screen.getByText(tooltipContent)).toBeInTheDocument();
  });
});
