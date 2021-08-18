import { mount } from 'enzyme';
import { KsqlCommandResponse } from 'generated-sources';
import React from 'react';
import ResultRenderer from 'components/KsqlDb/Query/ResultRenderer';

describe('Result Renderer', () => {
  const result: KsqlCommandResponse = {};

  it('Matches snapshot', () => {
    const component = mount(<ResultRenderer result={result} />);

    expect(component).toMatchSnapshot();
  });
});
