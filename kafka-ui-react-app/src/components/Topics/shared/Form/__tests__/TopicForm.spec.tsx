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

describe('TopicForm', () => {
  it('renders', () => {
    renderComponent();

    expect(
      screen.getByRole('textbox', { name: 'Topic Name *' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('spinbutton', { name: 'Number of partitions *' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'Replication Factor *' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('spinbutton', { name: 'Min In Sync Replicas *' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listbox', { name: 'Cleanup policy' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('spinbutton', { name: 'Time to retain data (in ms)' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12h' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4w' })).toBeInTheDocument();

    expect(
      screen.getByRole('listbox', { name: 'Max size on disk in GB' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: 'Maximum message size in bytes *',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Custom parameters' })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
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
