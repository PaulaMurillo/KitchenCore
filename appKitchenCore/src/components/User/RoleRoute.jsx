import PropTypes from "prop-types";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { UserContext } from "../../context/UserContext";

/** Protege una ruta segun autenticacion y roles permitidos. */
export function RoleRoute({ children, requiredRoles = [], requireAuth = true }) {
  const { decodeToken } = useContext(UserContext);
  const location = useLocation();
  const userData = decodeToken();
  const isLogged = userData && Object.keys(userData).length > 0;

  if (requireAuth && !isLogged) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  if (
    requiredRoles.length > 0 &&
    (!userData?.rol?.name || !requiredRoles.includes(userData.rol.name))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  requireAuth: PropTypes.bool,
};
