import { shallow } from 'enzyme';
import React from 'react';
import JSONDiffViewer from 'components/common/JSONDiffViewer/JSONDiffViewer';

describe('JSONEditor component', () => {
  const left = '{\n}';
  const right = '{\ntest: true\n}';
  it('matches the snapshot', () => {
    const component = shallow(
      <JSONDiffViewer value={[left, right]} name="name" />
    );
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height', () => {
    const component = shallow(
      <JSONDiffViewer value={[left, right]} name="name" isFixedHeight />
    );
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height with no value', () => {
    const component = shallow(<JSONDiffViewer name="name" isFixedHeight />);
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot without fixed height with no value', () => {
    const component = shallow(<JSONDiffViewer name="name" />);
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot without fixed height with one value', () => {
    const component = shallow(<JSONDiffViewer value={[left]} name="name" />);
    expect(component).toMatchSnapshot();
  });
});
