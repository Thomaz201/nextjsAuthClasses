import decode from 'jwt-decode';
import { useAuthenticationContext } from '../contexts/AuthContext';
import { setupApiClient } from '../services/api';
import { api } from '../services/apiClient';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Metrics() {
  return (
    <div>
      <h1>Metrics</h1>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClientOnBackend = setupApiClient(ctx);
    const response = await apiClientOnBackend.get('/me');

    return {
      props: {},
    };
  },
  {
    permissions: ['metrics.list'],
    roles: ['administrator'],
  },
);
