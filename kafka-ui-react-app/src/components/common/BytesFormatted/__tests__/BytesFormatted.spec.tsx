import { shallow } from 'enzyme';
import React from 'react';
import BytesFormatted, { sizes } from '../BytesFormatted';

describe('BytesFormatted', () => {
  it('renders Bytes correctly', () => {
    const component = shallow(<BytesFormatted value={666} />);
    expect(component.text()).toEqual('666Bytes');
  });

  it('renders correct units', () => {
    let value = 1;
    sizes.forEach((unit) => {
      const component = shallow(<BytesFormatted value={value} />);
      expect(component.text()).toEqual(`1${unit}`);
      value *= 1024;
    });
  });

  it('renders correct precision', () => {
    let component = shallow(<BytesFormatted value={2000} precision={100} />);
    expect(component.text()).toEqual(`1.953125${sizes[1]}`);

    component = shallow(<BytesFormatted value={10000} precision={5} />);
    expect(component.text()).toEqual(`9.76563${sizes[1]}`);
  });

  it('correctly handles invalid props', () => {
    let component = shallow(<BytesFormatted value={10000} precision={-1} />);
    expect(component.text()).toEqual(`10${sizes[1]}`);

    component = shallow(<BytesFormatted value="some string" />);
    expect(component.text()).toEqual(`-${sizes[0]}`);

    component = shallow(<BytesFormatted value={undefined} />);
    expect(component.text()).toEqual(`0${sizes[0]}`);
  });
});
