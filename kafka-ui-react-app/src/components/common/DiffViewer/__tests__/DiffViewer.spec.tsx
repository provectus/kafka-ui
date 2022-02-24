import React from 'react';
import { render } from 'lib/testHelpers';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';
import { screen } from '@testing-library/react';

describe('Editor component', () => {
  const left = '{\n}';
  const right = '{\ntest: true\n}';
  const renderComponent = (props: {
    leftVersion?: string;
    rightVersion?: string;
    isFixedHeight?: boolean;
  }) => {
    render(
      <DiffViewer
        value={[props.leftVersion ?? '', props.rightVersion ?? '']}
        name="name"
        schemaType="JSON"
        isFixedHeight={props.isFixedHeight}
      />
    );
  };

  it('renders', () => {
    renderComponent({ leftVersion: left, rightVersion: right });
    expect(screen.getByTestId('diffviewer')).toBeInTheDocument();
  });

  it('renders with fixed height', () => {
    renderComponent({
      leftVersion: left,
      rightVersion: right,
      isFixedHeight: true,
    });
    const wrapper = screen.getByTestId('diffviewer');
    expect(wrapper.firstChild).toHaveStyle('height: 500px');
  });

  it('renders with fixed height with no value', () => {
    renderComponent({ isFixedHeight: true });
    const wrapper = screen.getByTestId('diffviewer');
    expect(wrapper.firstChild).toHaveStyle('height: 500px');
  });

  it('renders without fixed height with no value', () => {
    renderComponent({});
    const wrapper = screen.getByTestId('diffviewer');
    expect(wrapper.firstChild).toHaveStyle('height: 32px');
  });

  it('renders without fixed height with one value', () => {
    renderComponent({ leftVersion: left });
    const wrapper = screen.getByTestId('diffviewer');
    expect(wrapper.firstChild).toHaveStyle('height: 48px');
  });
});
