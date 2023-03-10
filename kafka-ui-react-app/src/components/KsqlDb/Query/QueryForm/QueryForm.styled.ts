import styled, { css } from 'styled-components';
import BaseSQLEditor from 'components/common/SQLEditor/SQLEditor';

export const QueryWrapper = styled.div`
  padding: 16px;
`;

export const KSQLInputsWrapper = styled.div`
  display: flex;
  gap: 24px;
  padding-bottom: 16px;
`;

export const KSQLInputHeader = styled.div`
  display: flex;
  justify-content: space-between;
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
        ${readOnly && theme.ksqlDb.query.editor.readonly.cursor}
      }
      .ace_print-margin {
        display: none;
      }
    `
);
