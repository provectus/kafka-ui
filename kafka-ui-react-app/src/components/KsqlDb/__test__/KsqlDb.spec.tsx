import React from 'react';
import KsqlDb from 'components/KsqlDb/KsqlDb';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { clusterKsqlDbPath } from 'lib/paths';

describe('KsqlDb Component', () => {
  describe('KsqlDb', () => {
    it('to be in the document', () => {
      render(<KsqlDb />, { pathname: clusterKsqlDbPath() });
      expect(screen.getByText('KSQL DB')).toBeInTheDocument();
      expect(screen.getByText('Execute KSQL Request')).toBeInTheDocument();
    });
  });
});
