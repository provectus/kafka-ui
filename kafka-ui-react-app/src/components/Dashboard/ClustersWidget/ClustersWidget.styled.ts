import styled from 'styled-components';

interface ClusterNameProps {
  maxWidth?: string;
}

export const SwitchWrapper = styled.div`
  padding: 16px;
`;

export const ClusterName = styled.td<ClusterNameProps>`
  padding: 16px;
  word-break: break-word;
  max-width: ${(props) => (props.maxWidth ? props.maxWidth : 'auto')};
`;
