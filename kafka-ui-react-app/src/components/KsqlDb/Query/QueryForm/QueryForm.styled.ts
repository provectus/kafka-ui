import styled, { css } from 'styled-components';
import BaseSQLEditor from 'components/common/SQLEditor/SQLEditor';

export const QueryWrapper = styled.div`
  padding: 16px;
`;

export const KSQLInputsWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 24px;

  padding-bottom: 16px;
  & > div {
    flex-grow: 1;
  }
`;

export const KSQLInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.default.color.normal};
`;

export const KSQLButtons = styled.div`
  display: flex;
  gap: 16px;
`;

export const StreamPropertiesContainer = styled.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 50%;
  color: ${({ theme }) => theme.default.color.normal};
`;

export const InputsContainer = styled.div`
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

export const StreamPropertiesInputWrapper = styled.div`
  & {
    width: 100%;
  }
  & > input {
    width: 100%;
    height: 40px;
    border: 1px solid grey;
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.input.borderColor.focus};
      &::placeholder {
        color: transparent;
      }
    }
    border-radius: 4px;
    font-size: 16px;
    padding-left: 15px;
    background-color: ${({ theme }) => theme.input.backgroundColor.normal};
    color: ${({ theme }) => theme.input.color.normal};
  }
`;

export const DeleteButtonWrapper = styled.div`
  min-height: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: flex-start;
  margin-top: 10px;
`;

export const Fieldset = styled.fieldset`
  width: 50%;
`;

export const SQLEditor = styled(BaseSQLEditor)(
  ({ readOnly, theme }) =>
    css`
      background: ${readOnly && theme.ksqlDb.query.editor.readonly.background};
      .ace-cursor {
        ${readOnly && `background: ${theme.default.transparentColor} `}
      }

      .ace_content {
        background-color: ${theme.default.backgroundColor};
        color: ${theme.default.color.normal};
      }
      .ace_line {
        background-color: ${theme.ksqlDb.query.editor.activeLine
          .backgroundColor};
      }
      .ace_gutter-cell {
        background-color: ${theme.ksqlDb.query.editor.cell.backgroundColor};
      }
      .ace_gutter-layer {
        background-color: ${theme.ksqlDb.query.editor.layer.backgroundColor};
        color: ${theme.default.color.normal};
      }
      .ace_cursor {
        color: ${theme.ksqlDb.query.editor.cursor};
      }

      .ace_print-margin {
        display: none;
      }
    `
);
