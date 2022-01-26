import { shallow } from 'enzyme';
import React from 'react';
import DiffViewer from 'components/common/DiffViewer/DiffViewer';

describe('Editor component', () => {
  const left = '{\n}';
  const right = '{\ntest: true\n}';
  it('matches the snapshot', () => {
    const component = shallow(
      <DiffViewer value={[left, right]} name="name" schemaType="JSON" />
    );
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height', () => {
    const component = shallow(
      <DiffViewer
        value={[left, right]}
        name="name"
        isFixedHeight
        schemaType="JSON"
      />
    );
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height with no value', () => {
    const component = shallow(
      <DiffViewer name="name" isFixedHeight schemaType="JSON" />
    );
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot without fixed height with no value', () => {
    const component = shallow(<DiffViewer name="name" schemaType="JSON" />);
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot without fixed height with one value', () => {
    const component = shallow(
      <DiffViewer value={[left]} name="name" schemaType="JSON" />
    );
    expect(component).toMatchSnapshot();
  });
});
