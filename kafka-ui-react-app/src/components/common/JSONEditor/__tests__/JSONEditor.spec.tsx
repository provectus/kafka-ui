import { shallow } from 'enzyme';
import React from 'react';
import JSONEditor from '../JSONEditor';

describe('JSONEditor component', () => {
  it('matches the snapshot', () => {
    const component = shallow(<JSONEditor value="{}" name="name" />);
    expect(component).toMatchSnapshot();
  });
});
