import React, { PropsWithChildren } from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import TimeToRetainBtns, {
  Props,
} from 'components/Topics/shared/Form/TimeToRetainBtns';
import { FormProvider, useForm } from 'react-hook-form';

describe('TimeToRetainBtns', () => {
  const defaultProps: Props = {
    name: 'defaultPropsTestingName',
    value: 'defaultPropsValue',
  };
  const Wrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  const SetUpComponent = (props: Props = defaultProps) => {
    const { name, value } = props;

    render(
      <Wrapper>
        <TimeToRetainBtns name={name} value={value} />
      </Wrapper>
    );
  };

  it('should test the normal view rendering of the component', () => {
    SetUpComponent();
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });
});
