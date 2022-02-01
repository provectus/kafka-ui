import React from 'react';
import { KsqlTableResponse, Table } from 'generated-sources';

import * as S from './ResultRenderer.styled';

// const ResultRenderer: React.FC<{ result: KsqlCommandResponse | null }> = ({
const ResultRenderer: React.FC<{ result: KsqlTableResponse | null }> = ({
  result,
}) => {
  if (!result) return null;

  // const isMessage = !!result.message;
  //
  // if (isMessage) return <div className="box">{result.message}</div>;
  //
  // const isTable = result.data !== undefined;
  //
  // if (!isTable) return null;

  // if (isMessage) return <S.Wrapper>{result.message}</S.Wrapper>;

  // const isTable = result.data !== undefined;

  // if (!isTable) return null;

  // const rawTable = result.data as Table;

  // const { headers, rows } = rawTable;

  const {
    header: tableHeader,
    columnNames: headers = [],
    values: rows = [],
  } = result;

  const transformedRows = React.useMemo(
    () =>
      rows.map((row) =>
        row.reduce(
          (res, acc, index) => ({
            ...res,
            [headers[index]]: acc,
          }),
          {} as Dictionary<string>
        )
      ),
    []
  );

  return (
    <S.Wrapper>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transformedRows.map((row) => (
            <tr key={row.name}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length}>No tables or streams found</td>
            </tr>
          )}
        </tbody>
      </table>
    </S.Wrapper>
  );
};

export default ResultRenderer;
