import styled, { css, keyframes } from 'styled-components';
import { ControlledMenu } from '@szhsin/react-menu';
import { menuSelector, menuItemSelector } from '@szhsin/react-menu/style-utils';

import '@szhsin/react-menu/dist/core.css';

const menuShow = keyframes`
  from {
    opacity: 0;
  }
`;
const menuHide = keyframes`
  to {
    opacity: 0;
  }
`;

export const Dropdown = styled(ControlledMenu)(
  ({ theme: { dropdown } }) => css`
    // container for the menu items
    ${menuSelector.name} {
      border: 1px solid ${dropdown.borderColor};
      box-shadow: 0px 4px 16px ${dropdown.shadow};
      padding: 8px 0;
      border-radius: 4px;
      font-size: 14px;
      background-color: ${dropdown.backgroundColor};
      text-align: left;
    }

    ${menuSelector.stateOpening} {
      animation: ${menuShow} 0.15s ease-out;
    }

    // NOTE: animation-fill-mode: forwards is required to
    // prevent flickering with React 18 createRoot()
    ${menuSelector.stateClosing} {
      animation: ${menuHide} 0.2s ease-out forwards;
    }

    ${menuItemSelector.name} {
      padding: 6px 16px;
      min-width: 150px;
      background-color: ${dropdown.item.backgroundColor.default};
      white-space: nowrap;
    }

    ${menuItemSelector.hover} {
      background-color: ${dropdown.item.backgroundColor.hover};
    }

    ${menuItemSelector.disabled} {
      cursor: not-allowed;
    }
  `
);

export const DropdownButton = styled.button`
  background-color: transparent;
  border: none;
  display: flex;
  cursor: pointer;
`;

export const DangerItem = styled.div`
  color: ${({ theme: { dropdown } }) => dropdown.item.color.danger};
`;

export const DropdownItemHint = styled.div`
  color: ${({ theme }) => theme.topicMetaData.color.label};
  font-size: 12px;
  margin-top: 5px;
`;
