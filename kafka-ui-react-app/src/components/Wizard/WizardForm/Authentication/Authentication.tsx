import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import React, { useState } from 'react';
import Select from 'components/common/Select/Select';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { useFormContext } from 'react-hook-form';

const options = [
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'SASL_SSL',
    label: 'SASL_SSL',
  },
  {
    value: 'SASL_PLAINTEXT',
    label: 'SASL_PLAINTEXT',
  },
];
const Authentication = () => {
  const [value, setValue] = useState<string | number>('');

  // const methods = useForm<AddMessageFilters>({
  //   mode: 'onChange',
  //   defaultValues: {
  //     securedWithSSL: false,
  //     saslType: 'none',
  //   },
  //   resolver: yupResolver(validationSchema),
  // });
  // const {
  //   handleSubmit,
  //   control,
  //   formState: { isDirty, isSubmitting, isValid, errors },
  //   reset,
  // } = methods;
  // const { fields, append, remove } = useFieldArray<
  //   FormValues,
  //   'saslType'
  //   >({
  //   name: 'saslType',
  // });
  const methods = useFormContext();
  const onChange = (e: string | number) => {
    setValue(e);
    methods.register('saslType');
  };
  const isSecuredWithSSL = methods.watch('securedWithSSL');
  return (
    <S.Section>
      <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
        Authentication
      </S.SectionName>
      <div className="md:mt-0 md:col-span-3">
        <div className="sm:overflow-hidden h-full">
          <div className="px-4 py-5">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-3">
                {isSecuredWithSSL && (
                  <Select
                    name="saslType"
                    placeholder="Select"
                    minWidth="270px"
                    onChange={(e) => onChange(e)}
                    value={value}
                    options={options}
                  />
                )}
              </div>
              <div className="col-span-6">
                <div className="flex items-start">
                  <S.CheckboxWrapper>
                    <input
                      {...methods.register('securedWithSSL')}
                      name="securedWithSSL"
                      type="checkbox"
                    />
                    <InputLabel>Secured With SSL</InputLabel>
                  </S.CheckboxWrapper>
                  <div className="ml-3">
                    <label
                      className="block text-sm font-medium text-gray-700 whitespace-nowrap mr-2 svelte-55p6jf"
                      htmlFor="securedWithSSL"
                    >
                      Secured with SSL
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="securedWithSSL"
                      name="securedWithSSL"
                      type="checkbox"
                      className="checkbox"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      className="block text-sm font-medium text-gray-700 whitespace-nowrap mr-2 svelte-55p6jf"
                      htmlFor="securedWithSSL"
                    >
                      Secured with SSL
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </S.Section>
  );
};

export default Authentication;
