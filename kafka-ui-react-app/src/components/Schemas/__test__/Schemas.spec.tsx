import React from 'react';
import { shallow } from 'enzyme';
import { StaticRouter } from 'react-router-dom';
import Schemas from 'components/Schemas/Schemas';

describe('Schemas', () => {
  const pathname = `/ui/clusters/clusterName/schemas`;

  it('renders', () => {
    const wrapper = shallow(
      <StaticRouter location={{ pathname }} context={{}}>
        <Schemas />
      </StaticRouter>
    );

    expect(wrapper.exists('Schemas')).toBeTruthy();
  });
});
