import { shallow } from 'enzyme';
import React from 'react';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';

describe('SQLEditor component', () => {
  it('matches the snapshot', () => {
    const component = shallow(<SQLEditor value="" name="name" />);
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height', () => {
    const component = shallow(<SQLEditor value="" name="name" isFixedHeight />);
    expect(component).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height with no value', () => {
    const component = shallow(<SQLEditor name="name" isFixedHeight />);
    expect(component).toMatchSnapshot();
  });
});
