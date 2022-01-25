import { useAuthenticationContext } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuthenticationContext();

  return (
    <div>
      <h1>Dashboard de quem está logado: {user?.email}</h1>
    </div>
  );
}
