import React from 'react';
import { render } from 'lib/testHelpers';
import theme from 'theme/theme';
import { screen } from '@testing-library/react';
import * as S from 'components/Nav/ClusterTab/ClusterTab.styled';
import { ServerStatus } from 'generated-sources';

describe('Cluster Styled Components', () => {
  describe('Wrapper Component', () => {
    it('should check the rendering and correct Styling when it is open', () => {
      render(<S.Wrapper isOpen />);
      expect(screen.getByRole('menuitem')).toHaveStyle(
        `color:${theme.menu.color.isOpen}`
      );
    });
    it('should check the rendering and correct Styling when it is Not open', () => {
      render(<S.Wrapper isOpen={false} />);
      expect(screen.getByRole('menuitem')).toHaveStyle(
        `color:${theme.menu.color.normal}`
      );
    });
  });

  describe('StatusIcon Component', () => {
    it('should check the rendering and correct Styling when it is online', () => {
      render(<S.StatusIcon status={ServerStatus.ONLINE} />);

      expect(screen.getByRole('status-circle')).toHaveStyle(
        `fill:${theme.menu.statusIconColor.online}`
      );
    });

    it('should check the rendering and correct Styling when it is offline', () => {
      render(<S.StatusIcon status={ServerStatus.OFFLINE} />);
      expect(screen.getByRole('status-circle')).toHaveStyle(
        `fill:${theme.menu.statusIconColor.offline}`
      );
    });

    it('should check the rendering and correct Styling when it is Initializing', () => {
      render(<S.StatusIcon status={ServerStatus.INITIALIZING} />);
      expect(screen.getByRole('status-circle')).toHaveStyle(
        `fill:${theme.menu.statusIconColor.initializing}`
      );
    });
  });
});
