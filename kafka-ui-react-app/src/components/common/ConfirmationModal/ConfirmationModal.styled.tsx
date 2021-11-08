import styled from 'styled-components';
import { Colors } from 'theme/theme';

const ConfirmationModalWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  position: fixed;
  z-index: 40;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  & div:first-child {
    background-color: rgba(10, 10, 10, 0.1);
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  & div:last-child {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 560px;
    border-radius: 8px;

    background-color: ${Colors.neutral[0]};
    filter: drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.1));

    & > * {
      padding: 16px;
      width: 100%;
    }

    & > header {
      height: 64px;
      font-size: 20px;
      text-align: start;
    }

    & > section {
      border-top: 1px solid ${Colors.neutral[5]};
      border-bottom: 1px solid ${Colors.neutral[5]};
    }

    & > footer {
      height: 64px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }
`;

export default ConfirmationModalWrapper;
