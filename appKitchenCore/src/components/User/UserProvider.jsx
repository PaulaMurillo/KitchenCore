import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../context/UserContext';



/** Proporciona el estado y las operaciones de autenticación a la aplicación. */
export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  /** Guarda el token del usuario y marca la sesión como autenticada. */
  const saveUser = useCallback((user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  }, []);

  /** Elimina la sesión almacenada del usuario. */
  const clearUser = useCallback(() => {
    setUser({});
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);
  /** Decodifica el token JWT del usuario autenticado. */
  const decodeToken = useCallback(() => {
    if (user && Object.keys(user).length > 0) {
      const decodedToken = jwtDecode(user);
      
      return decodedToken;
    } else {
      return {};
    }
  }, [user]);

  //requiredRoles=['Administrador','Cliente']
  /** Comprueba si el usuario posee alguno de los roles requeridos. */
  const autorize = useCallback(({ requiredRoles }) => {
    const userData = decodeToken();
    if (userData && requiredRoles) {
      console.log(
        userData && userData.rol && requiredRoles.includes(userData.rol.name),
      );
      return (
        userData && userData.rol && requiredRoles.includes(userData.rol.name)
      );
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
