import React from 'react';
import { Indicator } from 'components/common/Metrics';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { Props } from 'components/common/Metrics/Indicator';
import { theme } from 'theme/theme';

const title = 'Test Title';
const label = 'Test Label';
const child = 'Child';

describe('Indicator', () => {
  const setupComponent = (props: Partial<Props> = {}) =>
    render(
      <Indicator title={props.title} label={props.label} {...props}>
        {child}
      </Indicator>
    );

  it('renders indicator', () => {
    setupComponent({ title, label });
    expect(screen.getByTitle(title)).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(child)).toBeInTheDocument();
  });

  describe('should render circular alert', () => {
    const getCircle = () => screen.getByRole('circle');

    it('should be in document', () => {
      setupComponent({ title, label, isAlert: true });
      expect(screen.getByRole('svg')).toBeInTheDocument();
      expect(getCircle()).toBeInTheDocument();
    });

    it('success alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'success' });
      expect(getCircle()).toHaveStyle(
        `fill: ${theme.circularAlert.color.success}`
      );
    });

    it('error alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'error' });
      expect(getCircle()).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
    });

    it('warning alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'warning' });
      expect(getCircle()).toHaveStyle(
        `fill: ${theme.circularAlert.color.warning}`
      );
    });

    it('info alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'info' });
      expect(getCircle()).toHaveStyle(
        `fill: ${theme.circularAlert.color.info}`
      );
    });
  });
});
