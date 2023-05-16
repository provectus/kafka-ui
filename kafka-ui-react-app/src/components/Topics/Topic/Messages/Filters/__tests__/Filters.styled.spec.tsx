import React from 'react';
import { render } from 'lib/testHelpers';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import { screen } from '@testing-library/react';
import { theme } from 'theme/theme';

describe('Filters Styled components', () => {
  describe('MessageLoading component', () => {
    it('should check the styling during live', () => {
      render(<S.MessageLoading isLive />);
      expect(screen.getByRole('contentLoader')).toHaveStyle({
        color: theme.heading.h3.color,
        'font-size': theme.heading.h3.fontSize,
        display: 'flex',
      });
    });

    it('should check the styling during not live', () => {
      render(<S.MessageLoading isLive={false} />);
      expect(screen.getByRole('contentLoader', { hidden: true })).toHaveStyle({
        color: theme.heading.h3.color,
        'font-size': theme.heading.h3.fontSize,
        display: 'none',
      });
    });
  });
});
