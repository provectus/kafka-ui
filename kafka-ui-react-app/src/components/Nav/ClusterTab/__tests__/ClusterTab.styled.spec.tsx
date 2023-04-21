import React from 'react';
import { render } from 'lib/testHelpers';
import { theme } from 'theme/theme';
import { screen } from '@testing-library/react';
import * as S from 'components/Nav/ClusterTab/ClusterTab.styled';
import { ServerStatus } from 'generated-sources';

describe('Cluster Styled Components', () => {
  const getMenuItem = () => screen.getByRole('menuitem');
  describe('Wrapper Component', () => {
    it('should check the rendering and correct Styling when it is open', () => {
      render(<S.Wrapper isOpen />);
      expect(getMenuItem()).toHaveStyle(`color:${theme.menu.color.isOpen}`);
    });
    it('should check the rendering and correct Styling when it is Not open', () => {
      render(<S.Wrapper isOpen={false} />);
      expect(getMenuItem()).toHaveStyle(`color:${theme.menu.color.normal}`);
    });
  });

  describe('StatusIcon Component', () => {
    const getStatusCircle = () => screen.getByRole('status-circle');
    it('should check the rendering and correct Styling when it is online', () => {
      render(
        <svg>
          <S.StatusIcon status={ServerStatus.ONLINE} />
        </svg>
      );

      expect(getStatusCircle()).toHaveStyle(
        `fill:${theme.menu.statusIconColor.online}`
      );
    });

    it('should check the rendering and correct Styling when it is offline', () => {
      render(
        <svg>
          <S.StatusIcon status={ServerStatus.OFFLINE} />
        </svg>
      );
      expect(getStatusCircle()).toHaveStyle(
        `fill:${theme.menu.statusIconColor.offline}`
      );
    });

    it('should check the rendering and correct Styling when it is Initializing', () => {
      render(
        <svg>
          <S.StatusIcon status={ServerStatus.INITIALIZING} />
        </svg>
      );
      expect(getStatusCircle()).toHaveStyle(
        `fill:${theme.menu.statusIconColor.initializing}`
      );
    });
  });
});
