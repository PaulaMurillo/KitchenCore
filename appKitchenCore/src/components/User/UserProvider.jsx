import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../context/UserContext';

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

/** Proporciona el estado y las operaciones de autenticacion a la aplicacion. */
export default function UserProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()));

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  /** Guarda el token del usuario y marca la sesion como autenticada. */
  const saveUser = useCallback((user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  }, []);

  /** Elimina la sesion almacenada del usuario. */
  const clearUser = useCallback(() => {
    setUser({});
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  /** Decodifica el token JWT del usuario autenticado. */
  const decodeToken = useCallback(() => {
    if (user && Object.keys(user).length > 0) {
      return jwtDecode(user);
    }

    return {};
  }, [user]);

  /** Comprueba si el usuario posee alguno de los roles requeridos. */
  const autorize = useCallback(({ requiredRoles }) => {
    const userData = decodeToken();
    if (userData && requiredRoles) {
      return userData && userData.rol && requiredRoles.includes(userData.rol.name);
    }
    return false;
  }, [decodeToken]);

  UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        saveUser,
        clearUser,
        autorize,
        decodeToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
