
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';


/** Cierra la sesión local y redirige al formulario de ingreso. */
export function Logout() {
  const navigate = useNavigate();
  const { clearUser } = useContext(UserContext);
  useEffect(() => {
    clearUser();
    navigate('/user/login');
  }, [clearUser, navigate]);
  return null;
}
