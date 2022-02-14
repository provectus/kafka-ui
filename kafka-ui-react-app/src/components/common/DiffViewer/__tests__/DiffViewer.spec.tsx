import React from 'react';
import { render } from 'lib/testHelpers';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';

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
  });

  it('renders with fixed height', () => {
    renderComponent({
      leftVersion: left,
      rightVersion: right,
      isFixedHeight: true,
    });
  });

  it('renders with fixed height with no value', () => {
    renderComponent({ isFixedHeight: true });
  });

  it('renders without fixed height with no value', () => {
    renderComponent({});
  });

  it('renders without fixed height with one value', () => {
    renderComponent({ leftVersion: left });
  });
});
