import React, { PropsWithChildren } from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import TimeToRetainBtn, {
  Props,
} from 'components/Topics/shared/Form/TimeToRetainBtn';
import { useForm, FormProvider } from 'react-hook-form';
import theme from 'theme/theme';
import userEvent from '@testing-library/user-event';

describe('TimeToRetainBtn', () => {
  const defaultProps: Props = {
    inputName: 'defaultPropsInputName',
    text: 'defaultPropsText',
    value: 0,
  };
  const Wrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
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
        `background-color:${theme.button.secondary.backgroundColor.normal}`
      );
      expect(buttonElement).toHaveStyle(`border:none`);
    });
    it('should test the non active state with click becoming active', async () => {
      const buttonElement = screen.getByRole('button');
      await userEvent.click(buttonElement);
      expect(buttonElement).toHaveStyle(
        `background-color:${theme.button.secondary.invertedColors.normal}`
      );
      expect(buttonElement).toHaveStyle(`border:none`);
    });
  });

  describe('Component rendering with its Default Props Setups', () => {
    it('should test the active state of the button and its styling', () => {
      SetUpComponent({ value: 604800000 });
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveStyle(
        `background-color:${theme.button.secondary.invertedColors.normal}`
      );
      expect(buttonElement).toHaveStyle(`border:none`);
    });
  });
});
