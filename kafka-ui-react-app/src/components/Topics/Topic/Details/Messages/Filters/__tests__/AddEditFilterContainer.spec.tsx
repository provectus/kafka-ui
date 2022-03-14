import React from 'react';
import AddEditFilterContainer, {
  AddEditFilterContainerProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddEditFilterContainer';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

const setupComponent = (props: Partial<AddEditFilterContainerProps> = {}) => {
  const { title, submitBtnText, createNewFilterText } = props;
  render(
    <AddEditFilterContainer
      title={title || 'Test Title'}
      cancelBtnHandler={jest.fn()}
      submitBtnText={submitBtnText || 'Submit Button'}
      createNewFilterText={createNewFilterText || 'Create New Filters'}
      setToggleSaveFilter={jest.fn()}
      {...props}
    />
  );
};

describe('AddEditFilterContainer component', () => {
  it('should render the components', () => {
    setupComponent();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
