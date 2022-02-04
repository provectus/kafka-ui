import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { FormProvider, useForm } from 'react-hook-form';
import TopicForm, { Props } from 'components/Topics/shared/Form/TopicForm';
import userEvent from '@testing-library/user-event';

const isSubmitting = false;
const onSubmit = jest.fn();

const renderComponent = (props: Props = { isSubmitting, onSubmit }) => {
  const Wrapper: React.FC = ({ children }) => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return render(
    <Wrapper>
      <TopicForm {...props} />
    </Wrapper>
  );
};

const expectByRoleAndNameToBeInDocument = (
  role: string,
  accessibleName: string
) => {
  expect(screen.getByRole(role, { name: accessibleName })).toBeInTheDocument();
};

describe('TopicForm', () => {
  it('renders', () => {
    renderComponent();

    expectByRoleAndNameToBeInDocument('textbox', 'Topic Name *');

    expectByRoleAndNameToBeInDocument('spinbutton', 'Number of partitions *');
    expectByRoleAndNameToBeInDocument('spinbutton', 'Replication Factor *');

    expectByRoleAndNameToBeInDocument('spinbutton', 'Min In Sync Replicas *');
    expectByRoleAndNameToBeInDocument('listbox', 'Cleanup policy');

    expectByRoleAndNameToBeInDocument(
      'spinbutton',
      'Time to retain data (in ms)'
    );
    expectByRoleAndNameToBeInDocument('button', '12h');
    expectByRoleAndNameToBeInDocument('button', '2d');
    expectByRoleAndNameToBeInDocument('button', '7d');
    expectByRoleAndNameToBeInDocument('button', '4w');

    expectByRoleAndNameToBeInDocument('listbox', 'Max size on disk in GB');
    expectByRoleAndNameToBeInDocument(
      'spinbutton',
      'Maximum message size in bytes *'
    );

    expectByRoleAndNameToBeInDocument('heading', 'Custom parameters');

    expectByRoleAndNameToBeInDocument('button', 'Send');
  });

  it('submits', () => {
    renderComponent({
      isSubmitting,
      onSubmit: onSubmit.mockImplementation((e) => e.preventDefault()),
    });

    userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toBeCalledTimes(1);
  });
});
