import { useEffect } from 'react';
import { useAuthenticationContext } from '../contexts/AuthContext';
import { api } from '../services/api';

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
