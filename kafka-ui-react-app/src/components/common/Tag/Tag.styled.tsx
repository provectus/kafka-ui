import styled from 'styled-components';

interface Props {
  color: 'green' | 'gray' | 'yellow' | 'red' | 'white' | 'blue';
}

export const Tag = styled.p<Props>`
  border: none;
  border-radius: 16px;
  height: 20px;
  line-height: 20px;
  background-color: ${(props) => props.theme.tag.backgroundColor[props.color]};
  color: ${(props) => props.theme.tag.color};
  font-size: 12px;
  display: inline-block;
  padding-left: 0.75em;
  padding-right: 0.75em;
  text-align: center;
  width: max-content;
`;
