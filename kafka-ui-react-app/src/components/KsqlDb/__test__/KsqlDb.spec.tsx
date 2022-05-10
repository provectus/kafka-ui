import React from 'react';
import KsqlDb from 'components/KsqlDb/KsqlDb';
import { StaticRouter } from 'react-router';
import { render } from '@testing-library/react';

describe('KsqlDb Component', () => {
  const pathname = `ui/clusters/local/ksql-db`;

  describe('KsqlDb', () => {
    const setupComponent = () => (
      <StaticRouter location={{ pathname }} context={{}}>
        <KsqlDb />
      </StaticRouter>
    );

    it('to be in the document', () => {
      const { container } = render(setupComponent());
      expect(container).toBeInTheDocument();
    });
  });
});
