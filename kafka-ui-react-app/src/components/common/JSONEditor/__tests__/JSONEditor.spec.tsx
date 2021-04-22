import { shallow } from 'enzyme';
import React from 'react';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

describe('JSONEditor component', () => {
  it('matches the snapshot', () => {
    const component = shallow(<JSONEditor value="{}" name="name" />);
    expect(component).toMatchSnapshot();
  });
});
