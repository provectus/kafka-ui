import { shallow } from 'enzyme';
import React from 'react';
import BytesFormatted, { sizes } from '../BytesFormatted';

describe('BytesFormatted', () => {
  it('renders Bytes correctly', () => {
    const component = shallow(
      <BytesFormatted value={Math.floor(Math.random() * 900 + 100)} />
    );
    expect(component.props().children.slice(3)).toEqual('Bytes');
  });

  it('renders correct units', () => {
    let value = 1;
    sizes.forEach((unit) => {
      const component = shallow(<BytesFormatted value={value} />);
      expect(component.props().children.slice(1)).toEqual(`${unit}`);
      value *= 1024;
    });
  });

  it('renders correct precision', () => {
    for (let i = 1; i <= 9; i += 1) {
      const component = shallow(
        <BytesFormatted
          value={Math.round(Math.random() * 100000)}
          precision={i}
        />
      );
      const splitted = component.props().children.slice(0, -2).split('.');
      if (splitted.length > 1) {
        expect(
          component.props().children.slice(0, -2).split('.')[1].length
        ).toBeLessThanOrEqual(i);
      }
    }
  });

  it('correctly handles invalid props', () => {
    const component = shallow(<BytesFormatted value={10000} precision={-1} />);
    expect(component.props().children.slice(0, -2)).toEqual('10');
  });
});
