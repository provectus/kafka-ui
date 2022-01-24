import React from 'react';
import { KsqlResponse, Table } from 'generated-sources';

const ResultRenderer: React.FC<{ result: Array<KsqlResponse> | null }> = ({
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
  //
  // const rawTable = result.data as Table;
  //
  // const { headers, rows } = rawTable;
  //
  // const transformedRows = React.useMemo(
  //   () =>
  //     rows.map((row) =>
  //       row.reduce(
  //         (res, acc, index) => ({
  //           ...res,
  //           [rawTable.headers[index]]: acc,
  //         }),
  //         {} as Dictionary<string>
  //       )
  //     ),
  //   []
  // );

  return (
    <div className="box">
      MDE
    </div>
  );
};

export default ResultRenderer;
