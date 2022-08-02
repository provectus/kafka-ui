import { useLocation } from 'react-router-dom';

const usePagination = () => {
  const { search, pathname } = useLocation();
  const params = new URLSearchParams(search);

  const page = params.get('page');
  const perPage = params.get('perPage');

  return {
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
    pathname,
  };
};

export default usePagination;
