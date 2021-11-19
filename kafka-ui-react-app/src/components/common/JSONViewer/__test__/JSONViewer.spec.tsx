import { shallow } from 'enzyme';
import React from 'react';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

const data = { a: 1 };

describe('JSONViewer component', () => {
  it('renders JSONTree', () => {
    const component = shallow(<JSONViewer data={JSON.stringify(data)} />);
    expect(component.exists('Styled(JSONEditor)')).toBeTruthy();
  });

  it('matches the snapshot with fixed height with no value', () => {
    const component = shallow(<JSONViewer data={data as unknown as string} />);
    expect(component.exists('JSONEditor')).toBeFalsy();
    expect(component.exists('p')).toBeTruthy();
  });
});
