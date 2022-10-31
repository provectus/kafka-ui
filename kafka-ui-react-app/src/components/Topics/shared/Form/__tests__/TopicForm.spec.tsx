import React, { PropsWithChildren } from 'react';
import { render } from 'lib/testHelpers';
import { fireEvent, screen } from '@testing-library/dom';
import { FormProvider, useForm } from 'react-hook-form';
import TopicForm, { Props } from 'components/Topics/shared/Form/TopicForm';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

const isSubmitting = false;
const onSubmit = jest.fn();

const renderComponent = (props: Props = { isSubmitting, onSubmit }) => {
  const Wrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
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
    expectByRoleAndNameToBeInDocument('button', '12 hours');
    expectByRoleAndNameToBeInDocument('button', '2 days');
    expectByRoleAndNameToBeInDocument('button', '7 days');
    expectByRoleAndNameToBeInDocument('button', '4 weeks');

    expectByRoleAndNameToBeInDocument('listbox', 'Max size on disk in GB');
    expectByRoleAndNameToBeInDocument(
      'spinbutton',
      'Maximum message size in bytes *'
    );

    expectByRoleAndNameToBeInDocument('heading', 'Custom parameters');

    expectByRoleAndNameToBeInDocument('button', 'Create topic');
  });

  it('submits', async () => {
    renderComponent({
      isSubmitting,
      onSubmit: onSubmit.mockImplementation((e) => e.preventDefault()),
    });

    await act(async () => {
      await userEvent.type(
        screen.getByPlaceholderText('Topic Name'),
        'topicName'
      );
    });
    await act(() => {
      fireEvent.submit(screen.getByLabelText('topic form'));
    });

    await userEvent.click(screen.getByRole('button', { name: 'Create topic' }));
    expect(onSubmit).toBeCalledTimes(1);
  });
});
