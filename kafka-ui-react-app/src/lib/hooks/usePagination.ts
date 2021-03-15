import { useLocation } from 'react-router';

const usePagination = () => {
  const params = new URLSearchParams(useLocation().search);

  const page = params.get('page');
  const perPage = params.get('perPage');

  return {
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
  };
};

export default usePagination;
