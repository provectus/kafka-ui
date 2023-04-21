export const convertPropsKeyToFormKey = (key: string) => {
  return key.split('.').join('___');
};
