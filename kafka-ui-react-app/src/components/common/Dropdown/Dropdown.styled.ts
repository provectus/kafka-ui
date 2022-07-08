import styled from 'styled-components';

export const TriggerWrapper = styled.div`
  display: flex;
  align-self: center;
`;

export const Trigger = styled.button.attrs({
  type: 'button',
  ariaHaspopup: 'true',
  ariaControls: 'dropdown-menu',
})`
  background: transparent;
  border: none;
  display: flex;
  align-items: 'center';
  justify-content: 'center';
  &:hover {
    cursor: pointer;
  }
`;

export const Item = styled.a.attrs({
  href: '#end',
  role: 'menuitem',
  type: 'button',
})<{ $isDanger: boolean }>`
  color: ${({ $isDanger, theme }) =>
    $isDanger ? theme.dropdown.color : 'initial'};
`;
