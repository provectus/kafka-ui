import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const DiffWrapper = styled.div`
  align-items: stretch;
  display: block;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  min-height: min-content;
  padding-top: 1.5rem !important;
  background: blue;
  &
    .ace_editor
    > .ace_scroller
    > .ace_content
    > .ace_marker-layer
    > .codeMarker {
    background: ${Colors.yellow[20]};
    position: absolute;
    z-index: 20;
  }
`;
