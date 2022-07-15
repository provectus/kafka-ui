import { Params, useParams } from 'react-router-dom';

export default function useAppParams<
  T extends { [K in keyof Params]?: string }
>() {
  return useParams<T>() as T;
}
