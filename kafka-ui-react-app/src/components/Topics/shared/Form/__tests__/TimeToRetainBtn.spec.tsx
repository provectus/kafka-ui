import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import TimeToRetainBtn, {
  Props,
} from 'components/Topics/shared/Form/TimeToRetainBtn';
import { useForm, FormProvider } from 'react-hook-form';
import theme from 'theme/theme';

describe('TimeToRetainBtn', () => {
  const defaultProps: Props = {
    inputName: 'defaultPropsInputName',
    text: 'defaultPropsText',
    value: 0,
  };
  const Wrapper: React.FC = ({ children }) => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  const SetUpComponent = (props: Partial<Props> = {}) => {
    const { inputName, text, value } = props;
    render(
      <Wrapper>
        <TimeToRetainBtn
          inputName={inputName || defaultProps.inputName}
          text={text || defaultProps.text}
          value={value || defaultProps.value}
        />
      </Wrapper>
    );
  };

  describe('Component rendering with its Default Props Setups', () => {
    beforeEach(() => {
      SetUpComponent();
    });
    it('should test the component rendering on the screen', () => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
    });
    it('should test the non active state of the button and its styling', () => {
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveStyle(
        `background-color:${theme.button.primary.backgroundColor.normal}`
      );
      expect(buttonElement).toHaveStyle(
        `border:1px solid ${theme.button.primary.color}`
      );
    });
  });

  describe('Component rendering with its Default Props Setups', () => {
    it('should test the active state of the button and its styling', () => {
      SetUpComponent({ value: 1000 });
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveStyle(
        `background-color:${theme.button.primary.backgroundColor.normal}`
      );
      expect(buttonElement).toHaveStyle(
        `border:1px solid ${theme.button.primary.color}`
      );
    });
  });
});
