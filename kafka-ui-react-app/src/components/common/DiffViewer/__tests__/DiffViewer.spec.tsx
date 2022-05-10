import React from 'react';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';
import { render } from '@testing-library/react';

describe('Editor component', () => {
  const left = '{\n}';
  const right = '{\ntest: true\n}';

  const renderComponent = (props: {
    leftVersion?: string;
    rightVersion?: string;
    isFixedHeight?: boolean;
  }) => {
    const { container } = render(
      <DiffViewer
        value={[props.leftVersion ?? '', props.rightVersion ?? '']}
        name="name"
        schemaType="JSON"
        isFixedHeight={props.isFixedHeight}
      />
    );
    return container;
  };

  it('renders', () => {
    const component = renderComponent({
      leftVersion: left,
      rightVersion: right,
    });
    expect(component).toBeInTheDocument();
  });

  it('renders with fixed height', () => {
    const component = renderComponent({
      leftVersion: left,
      rightVersion: right,
      isFixedHeight: true,
    }).children[0].children[0];
    expect(component).toHaveStyle('height: 500px;');
  });

  it('renders with fixed height with no value', () => {
    const component = renderComponent({
      isFixedHeight: true,
    }).children[0].children[0];
    expect(component).toHaveStyle('height: 500px;');
  });

  it('renders without fixed height with no value', () => {
    const component = renderComponent({}).children[0].children[0];
    expect(component).toHaveStyle('height: 32px;');
  });

  it('renders without fixed height with one value', () => {
    const component = renderComponent({
      leftVersion: left,
    }).children[0].children[0];
    expect(component).toHaveStyle('height: 48px;');
  });
});
