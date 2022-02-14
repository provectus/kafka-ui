import styled, { css } from 'styled-components';
import PageLoader from 'components/common/PageLoader/PageLoader';
import BaseSQLEditor from 'components/common/SQLEditor/SQLEditor';
import BaseEditor from 'components/common/Editor/Editor';

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
`;

export const KSQLButtons = styled.div`
  display: flex;
  gap: 16px;
`;

export const ContinuousLoader = styled(PageLoader)`
  & > div {
    transform: scale(0.5);
    padding-top: 0;
  }
`;

export const Fieldset = styled.fieldset`
  width: 100%;
`;

export const Editor = styled(BaseEditor)(
  ({ readOnly, theme }) =>
    readOnly &&
    css`
      &,
      &.ace-tomorrow {
        background: ${theme.ksqlDb.query.editor.readonly.background};
      }
      .ace-cursor {
        ${theme.ksqlDb.query.editor.readonly.cursor}
      }
    `
);

export const SQLEditor = styled(BaseSQLEditor)(
  ({ readOnly, theme }) =>
    readOnly &&
    css`
      background: ${theme.ksqlDb.query.editor.readonly.background};
      .ace-cursor {
        ${theme.ksqlDb.query.editor.readonly.cursor}
      }
    `
);
