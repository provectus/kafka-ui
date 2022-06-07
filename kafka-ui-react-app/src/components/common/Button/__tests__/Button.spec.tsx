import React from 'react';
import { Button } from 'components/common/Button/Button';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import theme from 'theme/theme';

describe('Button', () => {
  it('renders small primary Button', () => {
    render(<Button buttonType="primary" buttonSize="S" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyleRule(
      'color',
      theme.button.primary.color
    );
    expect(screen.getByRole('button')).toHaveStyleRule(
      'font-size',
      theme.button.fontSize.S
    );
  });

  it('renders medium size secondary Button', () => {
    render(<Button buttonType="secondary" buttonSize="M" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyleRule(
      'color',
      theme.button.secondary.color
    );
    expect(screen.getByRole('button')).toHaveStyleRule(
      'font-size',
      theme.button.fontSize.M
    );
  });

  it('renders small Button', () => {
    render(<Button buttonType="secondary" buttonSize="S" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyleRule(
      'color',
      theme.button.secondary.color
    );
  });

  it('renders link with large primary button inside', () => {
    render(<Button to="/my-link" buttonType="primary" buttonSize="L" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyleRule(
      'font-size',
      theme.button.fontSize.L
    );
  });

  it('renders inverted color Button', () => {
    render(<Button buttonType="primary" buttonSize="S" isInverted />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveStyleRule(
      'color',
      theme.button.primary.invertedColors.normal
    );
  });
});
