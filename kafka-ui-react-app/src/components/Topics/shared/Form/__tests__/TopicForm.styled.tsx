import React from 'react';
import { render } from 'lib/testHelpers';
import * as S from 'components/Topics/shared/Form/TopicForm.styled';
import { screen } from '@testing-library/react';
import theme from 'theme/theme';

describe('TopicForm styled components', () => {
  describe('Button', () => {
    it('should check the button styling in isActive state', () => {
      render(<S.Button isActive />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        border: `1px solid ${theme.button.border.active}`,
        backgroundColor: theme.button.primary.backgroundColor.active,
      });
    });

    it('should check the button styling in non Active state', () => {
      render(<S.Button isActive={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        border: `1px solid ${theme.button.primary.color}`,
        backgroundColor: theme.button.primary.backgroundColor.normal,
      });
    });
  });
});
