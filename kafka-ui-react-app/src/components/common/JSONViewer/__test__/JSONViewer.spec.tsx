import React from 'react';
import JSONViewer, {
  FullMessageProps,
} from 'components/common/JSONViewer/JSONViewer';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

const data = { a: 1 };
const maxLines = 28;
const schemaType = 'JSON';

describe('JSONViewer component', () => {
  const setupComponent = (props: FullMessageProps) =>
    render(<JSONViewer {...props} />);

  it('renders JSONTree', () => {
    setupComponent({
      data: JSON.stringify(data),
      maxLines,
      schemaType,
    });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('matches the snapshot with fixed height with no value', () => {
    setupComponent({
      data: '',
      maxLines,
      schemaType,
    });
  });
});
