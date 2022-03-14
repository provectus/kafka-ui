import React from 'react';
import AddEditFilterContainer, {
  AddEditFilterContainerProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddEditFilterContainer';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

describe('AddEditFilterContainer component', () => {
  const defaultTitle = 'Test Title';
  const defaultSubmitBtn = 'Submit Button';
  const defaultNewFilter = 'Create New Filters';

  const setupComponent = (props: Partial<AddEditFilterContainerProps> = {}) => {
    const { title, submitBtnText, createNewFilterText } = props;
    render(
      <AddEditFilterContainer
        title={title || defaultTitle}
        cancelBtnHandler={jest.fn()}
        submitBtnText={submitBtnText || defaultSubmitBtn}
        createNewFilterText={createNewFilterText || defaultNewFilter}
        setToggleSaveFilter={jest.fn()}
        {...props}
      />
    );
  };

  describe('default Component Parameters', () => {
    beforeEach(() => {
      setupComponent();
    });
    it('should render the components', () => {
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should check the default parameters values', () => {
      expect(screen.getByText(defaultTitle)).toBeInTheDocument();
      expect(screen.getByText(defaultSubmitBtn)).toBeInTheDocument();
      expect(screen.getByText(defaultNewFilter)).toBeInTheDocument();
    });
  });
});
