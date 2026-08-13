import { useEffect, useState } from 'react';
import { api } from '../lib/api';

let resourceCache = null;
let resourceRequest = null;

const fetchCatalogResources = () => {
  if (resourceCache) return Promise.resolve(resourceCache);

  if (!resourceRequest) {
    resourceRequest = Promise.all([api.get('/categories'), api.get('/brands')])
      .then(([categories, brands]) => {
        resourceCache = {
          categories: categories.data.items,
          brands: brands.data.items,
          loading: false,
        };
        return resourceCache;
      })
      .catch(() => ({ categories: [], brands: [], loading: false }))
      .finally(() => {
        resourceRequest = null;
      });
  }

  return resourceRequest;
};

export function useCatalogResources() {
  const [resources, setResources] = useState(
    resourceCache || { categories: [], brands: [], loading: true },
  );

  useEffect(() => {
    let active = true;

    fetchCatalogResources().then((value) => {
      if (active) setResources(value);
    });

    return () => {
      active = false;
    };
  }, []);

  return resources;
}

export function useProducts(filters) {
  const filterKey = JSON.stringify(filters);
  const [state, setState] = useState({
    products: [],
    pagination: null,
    loading: true,
    error: '',
    dataKey: '',
  });
  useEffect(() => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    api
      .get('/products', { params: JSON.parse(filterKey) })
      .then(({ data }) =>
        setState({
          products: data.products,
          pagination: data.pagination,
          loading: false,
          error: '',
          dataKey: filterKey,
        }),
      )
      .catch(() =>
        setState({
          products: [],
          pagination: null,
          loading: false,
          error: 'Unable to load products right now.',
          dataKey: '',
        }),
      );
  }, [filterKey]);
  return state;
}
