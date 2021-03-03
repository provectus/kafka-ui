import { shallow } from 'enzyme';
import React from 'react';
import BytesFormatted from '../BytesFormatted';

describe('BytesFormatted', () => {
  it('renders correct units', () => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let value = 1;
    units.forEach((unit) => {
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
});
