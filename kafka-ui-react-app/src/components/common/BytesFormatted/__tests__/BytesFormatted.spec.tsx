import React from 'react';
import BytesFormatted, {
  sizes,
} from 'components/common/BytesFormatted/BytesFormatted';
import { render, screen } from '@testing-library/react';

describe('BytesFormatted', () => {
  it('renders Bytes correctly', () => {
    render(<BytesFormatted value={666} />);
    expect(screen.getByText('666 Bytes')).toBeInTheDocument();
  });

  it('renders correct units', () => {
    let value = 1;
    sizes.forEach((unit) => {
      render(<BytesFormatted value={value} />);
      expect(screen.getByText(`1 ${unit}`)).toBeInTheDocument();
      value *= 1024;
    });
  });

  it('renders correct precision', () => {
    render(<BytesFormatted value={2000} precision={100} />);
    expect(screen.getByText(`1.953125 ${sizes[1]}`)).toBeInTheDocument();

    render(<BytesFormatted value={10000} precision={5} />);
    expect(screen.getByText(`9.76563 ${sizes[1]}`)).toBeInTheDocument();
  });

  it('correctly handles invalid props', () => {
    render(<BytesFormatted value={10000} precision={-1} />);
    expect(screen.getByText(`10 ${sizes[1]}`)).toBeInTheDocument();

    render(<BytesFormatted value="some string" />);
    expect(screen.getAllByText(`-${sizes[0]}`).length).toBeTruthy();

    render(<BytesFormatted value={-100000} />);
    expect(screen.getAllByText(`-${sizes[0]}`).length).toBeTruthy();

    render(<BytesFormatted value={undefined} />);
    expect(screen.getByText(`0 ${sizes[0]}`)).toBeInTheDocument();
  });
});
