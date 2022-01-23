import React from 'react';
import EditorViewer, {
  FullMessageProps,
} from 'components/common/EditorViewer/EditorViewer';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

const data = { a: 1 };
const maxLines = 28;
const schemaType = 'JSON';

describe('EditorViewer component', () => {
  const setupComponent = (props: FullMessageProps) =>
    render(<EditorViewer {...props} />);

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
