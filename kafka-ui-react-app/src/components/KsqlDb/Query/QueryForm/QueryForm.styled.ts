import styled, { css } from 'styled-components';
import BaseSQLEditor from 'components/common/SQLEditor/SQLEditor';

export const QueryWrapper = styled.div`
  padding: 16px;
`;

export const KSQLInputsWrapper = styled.div`
  display: flex;
  gap: 24px;
  padding-bottom: 16px;

  @media screen and (max-width: 769px) {
    flex-direction: column;
  }
`;

export const KSQLInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.default.color.normal};
`;

export const InputsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 30px;
  align-items: center;
  gap: 10px;
`;

export const Fieldset = styled.fieldset`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  color: ${({ theme }) => theme.default.color.normal};
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
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
