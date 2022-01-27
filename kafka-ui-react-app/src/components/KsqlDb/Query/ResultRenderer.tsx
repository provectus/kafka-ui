import React from 'react';
import { KsqlCommandResponse, Table } from 'generated-sources';

const ResultRenderer: React.FC<{ result: KsqlCommandResponse | null }> = ({
  result,
}) => {
  if (!result)
    return (
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit
        perferendis quibusdam vel debitis molestiae sed facere enim ab, laborum
        mollitia ipsa earum. Atque facilis quae non deserunt, voluptatibus
        delectus dolorum?
      </p>
    );

  const isMessage = !!result.message;

  if (isMessage) return <div className="box">{result.message}</div>;

  const isTable = result.data !== undefined;

  if (!isTable) return null;

  const rawTable = result.data as Table;

  const { headers, rows } = rawTable;

  const transformedRows = React.useMemo(
    () =>
      rows.map((row) =>
        row.reduce(
          (res, acc, index) => ({
            ...res,
            [rawTable.headers[index]]: acc,
          }),
          {} as Dictionary<string>
        )
      ),
    []
  );

  return (
    <div className="box">
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
    </div>
  );
};

export default ResultRenderer;
