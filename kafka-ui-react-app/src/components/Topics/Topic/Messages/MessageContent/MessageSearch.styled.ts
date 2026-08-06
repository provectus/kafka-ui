import styled, { css } from 'styled-components';

/**
 * A single compact control rather than a form field plus loose buttons, so the
 * bar reads as one find widget sitting alongside the tabs. Height matches the
 * tab buttons (32px) to keep the toolbar row aligned.
 */
export const Bar = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    width: 320px;
    padding: 0 4px 0 8px;
    background-color: ${theme.input.backgroundColor.normal};
    border: 1px solid ${theme.layout.stuffBorderColor};
    border-radius: 4px;

    &:focus-within {
      border-color: ${theme.input.borderColor.focus};
    }
  `
);

export const SearchIcon = styled.svg.attrs({
  viewBox: '0 0 16 16',
  'aria-hidden': true,
})`
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  fill: none;
  stroke: ${({ theme }) => theme.messageSearch.color};
  stroke-width: 1.6;
  stroke-linecap: round;
`;

export const Input = styled.input(
  ({ theme }) => css`
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: ${theme.input.color.normal};
    font-size: 14px;

    &::placeholder {
      color: ${theme.input.color.placeholder.normal};
    }
  `
);

/* Fixed width so stepping through matches does not shift the buttons around. */
export const Count = styled.span`
  flex-shrink: 0;
  min-width: 58px;
  text-align: right;
  color: ${({ theme }) => theme.messageSearch.color};
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

export const Divider = styled.span`
  flex-shrink: 0;
  width: 1px;
  height: 16px;
  margin: 0 2px;
  background-color: ${({ theme }) => theme.layout.stuffBorderColor};
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

export const IconButton = styled.button.attrs({ type: 'button' })(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 3px;
    background: transparent;
    /* Icons inherit this via currentColor, so hover and disabled states apply
       to them without per-theme icon tokens. */
    color: ${theme.messageSearch.color};
    cursor: pointer;

    & > svg {
      width: 12px;
      height: 12px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    &:hover:not(:disabled) {
      background-color: ${theme.layout.stuffColor};
      color: ${theme.input.color.normal};
    }

    &:disabled {
      opacity: 0.35;
      cursor: default;
    }
  `
);

export const PreviousButton = styled(IconButton)`
  & > svg {
    transform: rotate(180deg);
  }
`;
