import {
  Label,
  List,
} from 'components/common/PropertiesList/PropertiesList.styled';
import styled from 'styled-components';

export const ProgressContainer = styled.div`
  padding: 1.5rem 1rem;
  background: ${({ theme }) => theme.code.backgroundColor};
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 300px;
  text-align: center;

  ${List} {
    opacity: 0.5;

    ${Label} {
      text-align: right;
    }
  }
`;

export const ActionsBar = styled.div`
  display: flex;
  justify-content: end;
  gap: 8px;
  padding: 10px 20px;
  align-items: center;
`;

export const CreatedAt = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.statictics.createdAtColor};
`;

export const PartitionInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  column-gap: 24px;
`;

export const ProgressBarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 280px;
`;

export const PassedTime = styled.div`
  display: flex;
  width: 56px;
  justify-content: space-between;
`;
