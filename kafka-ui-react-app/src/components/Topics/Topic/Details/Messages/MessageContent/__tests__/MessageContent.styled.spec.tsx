import React from 'react';
import * as S from 'components/Topics/Topic/Details/Messages/MessageContent/MessageContent.styled';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import theme from 'theme/theme';

describe('MessageContent Styled Components', () => {
  describe('PaginationComponent', () => {
    beforeEach(() => {
      render(<S.PaginationButton />);
    });
    it('should test the Pagination Button theme related Props', () => {
      const button = screen.getByRole('button');
      expect(button).toHaveStyle(`color: ${theme.pagination.color.normal}`);
      expect(button).toHaveStyle(
        `border: 1px solid ${theme.pagination.borderColor.normal}`
      );
    });
  });
});
