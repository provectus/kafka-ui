import React from 'react';
import { KsqlTableResponse } from 'generated-sources';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';

import * as S from './ResultRenderer.styled';

// const ResultRenderer: React.FC<{ result: KsqlCommandResponse | null }> = ({
const ResultRenderer: React.FC<{ result: KsqlTableResponse }> = ({
  result,
}) => {
  const heading = React.useMemo(() => {
    return result.header || [];
  }, [result.header]);
  const ths = React.useMemo(() => {
    return result.columnNames || [];
  }, [result.columnNames]);
  const rows = React.useMemo(() => {
    return result.values || [];
  }, [result.values]);

  const transformedRows = React.useMemo(
    () =>
      rows.map((row) =>
        row.reduce(
          (res, acc, index) => ({
            ...res,
            [ths[index]]: acc,
          }),
          {} as Dictionary<string>
        )
      ),
    []
  );

  return (
    <S.Wrapper>
      <h3>{heading}</h3>
      <Table>
        <thead>
          <tr>
            {ths.map((th) => (
              <TableHeaderCell title={th} key={th} />
            ))}
          </tr>
        </thead>
        <tbody>
          {transformedRows.map((row) => (
            <tr key={row.name}>
              {ths.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={ths.length}>No tables or streams found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </S.Wrapper>
  );
};

export default ResultRenderer;
