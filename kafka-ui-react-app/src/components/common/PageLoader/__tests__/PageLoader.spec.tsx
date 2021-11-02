import { mount } from 'enzyme';
import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';

describe('PageLoader', () => {
  it('matches the snapshot', () => {
    expect(mount(<PageLoader />)).toMatchSnapshot();
  });
});
