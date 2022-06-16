import styled from 'styled-components';

export const DiffWrapper = styled.div`
  align-items: stretch;
  display: block;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  min-height: min-content;
  padding-top: 1.5rem !important;
  &
    .ace_editor
    > .ace_scroller
    > .ace_content
    > .ace_marker-layer
    > .codeMarker {
    background: ${({ theme }) => theme.icons.warningIcon};
    position: absolute;
    z-index: 20;
  }
`;

export const Section = styled.div`
  animation: fadein 0.5s;
`;

export const DiffBox = styled.div`
  flex-direction: column;
  margin-left: -0.75rem;
  margin-right: -0.75rem;
  margin-top: -0.75rem;
  box-shadow: none;
  padding: 1.25rem;
  &:last-child {
    margin-bottom: -0.75rem;
  }
`;

export const DiffTilesWrapper = styled.div`
  align-items: stretch;
  display: block;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  min-height: min-content;
  &:not(.is-child) {
    display: flex;
  }
`;

export const DiffTile = styled.div`
  flex: none;
  width: 50%;
`;

export const DiffVersionsSelect = styled.div`
  width: 0.625em;
`;
