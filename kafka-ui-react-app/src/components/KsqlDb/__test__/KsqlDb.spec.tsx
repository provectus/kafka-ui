import React from 'react';
import { mount } from 'enzyme';
import KsqlDb from 'components/KsqlDb/KsqlDb';
import { StaticRouter } from 'react-router';

describe('KsqlDb Component', () => {
  const pathname = `clusters/local/ksql-db`;

  describe('KsqlDb', () => {
    const setupComponent = () => (
      <StaticRouter location={{ pathname }} context={{}}>
        <KsqlDb />
      </StaticRouter>
    );

    it('matches snapshot', () => {
      expect(mount(setupComponent())).toMatchSnapshot();
    });
  });
});
