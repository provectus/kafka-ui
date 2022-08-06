import React from 'react';
import { render } from 'lib/testHelpers';
import TraceContent from 'components/Connect/Details/Tasks/TraceContent/TraceContent';

describe('Trace Content', () => {
  const setupComponent = (traceContent: string) =>
    render(
      <table>
        <tbody>
          <TraceContent traceContent={traceContent} />
        </tbody>
      </table>
    );

  it('renders Trace Content', () => {
    const { getByText } = setupComponent('Lorem ipsum');
    expect(getByText('Lorem ipsum')).toBeInTheDocument();
  });
});
