export const convertFormKeyToPropsKey = (key: string) => {
  return key.split('___').join('.');
};
