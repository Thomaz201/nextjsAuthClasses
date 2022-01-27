import { useEffect } from 'react';
import { useAuthenticationContext } from '../contexts/AuthContext';
import { setupApiClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuthenticationContext();

  useEffect(() => {
    api
      .get('me')
      .then((response) => console.log(response))
      .catch((error) => console.log('error dashboard', error));
  }, []);
  return (
    <div>
      <h1>Dashboard de quem está logado: {user?.email}</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClientOnBackend = setupApiClient(ctx);
  const response = await apiClientOnBackend.get('/me');

  console.log(response.data);

  return {
    props: {},
  };
});
