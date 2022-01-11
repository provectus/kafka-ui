import React from 'react';
import { Indicator } from 'components/common/Metrics';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { Props } from 'components/common/Metrics/Indicator';
import { Colors } from 'theme/theme';

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

  it('matches the snapshot', () => {
    setupComponent({ title, label });
    expect(screen.getByTitle(title)).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(child)).toBeInTheDocument();
  });

  describe('should render circular alert', () => {
    it('should be in document', () => {
      setupComponent({ title, label, isAlert: true });
      expect(screen.getByRole('svg')).toBeInTheDocument();
      expect(screen.getByRole('circle')).toBeInTheDocument();
    });

    it('success alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'success' });
      expect(screen.getByRole('circle')).toHaveStyle(
        `fill: ${Colors.green[40]}`
      );
    });

    it('error alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'error' });
      expect(screen.getByRole('circle')).toHaveStyle(`fill: ${Colors.red[50]}`);
    });

    it('warning alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'warning' });
      expect(screen.getByRole('circle')).toHaveStyle(
        `fill: ${Colors.yellow[10]}`
      );
    });

    it('info alert', () => {
      setupComponent({ title, label, isAlert: true, alertType: 'info' });
      expect(screen.getByRole('circle')).toHaveStyle(
        `fill: ${Colors.neutral[10]}`
      );
    });
  });
});
