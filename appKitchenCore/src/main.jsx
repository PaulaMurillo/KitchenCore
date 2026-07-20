import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./components/Home/Home";
import { PageNotFound } from "./components/Home/PageNotFound";

import UserProvider from "./components/User/UserProvider";
import { Unauthorized } from "./components/User/Unauthorized";
import { RoleRoute } from "./components/User/RoleRoute";
import { Login } from "./components/User/Login";
import { Logout } from "./components/User/Logout";
import { Signup } from "./components/User/Signup";
import { PerfilUsuario } from "./components/User/PerfilUsuario";
import { EditarPerfilUsuario } from "./components/User/EditarPerfilUsuario";
import { MantenimientoUsuarios } from "./components/User/MantenimientoUsuarios";
import { CrearUsuario } from "./components/User/CrearUsuario";
import { EditarUsuario } from "./components/User/EditarUsuario";
import { DetalleUsuario } from "./components/User/DetalleUsuario";

import { ListProductos } from "./components/Producto/ListProductos";
import { DetalleProducto } from "./components/Producto/DetalleProducto";
import { MantenimientoProductos } from "./components/Producto/MantenimientoProductos";
import { CrearProducto } from "./components/Producto/CrearProducto";
import { EditarProducto } from "./components/Producto/EditarProducto";

import { ListCombos } from "./components/Combo/ListCombos";
import { DetalleCombo } from "./components/Combo/DetalleCombo";
import { MantenimientoCombos } from "./components/Combo/MantenimientoCombos";
import { CrearCombo } from "./components/Combo/CrearCombo";
import { EditarCombo } from "./components/Combo/EditarCombo";

import { ListMenus } from "./components/Menu/ListMenus";
import { MenuDisponible } from "./components/Menu/MenuDisponible";
import { MantenimientoMenus } from "./components/Menu/MantenimientoMenus";
import { CrearMenu } from "./components/Menu/CrearMenu";
import { EditarMenu } from "./components/Menu/EditarMenu";
import { DetalleMenu } from "./components/Menu/DetalleMenu";

import { ListProcesos } from "./components/Proceso/ListProcesos";
import { DetalleProceso } from "./components/Proceso/DetalleProceso";
import { MantenimientoProcesos } from "./components/Proceso/MantenimientoProcesos";
import { CrearProceso } from "./components/Proceso/CrearProceso";
import { EditarProceso } from "./components/Proceso/EditarProceso";

import { ROLE_GROUPS } from "./config/rolePermissions";

const proteger = (element, requiredRoles) => (
  <RoleRoute requiredRoles={requiredRoles}>{element}</RoleRoute>
);

const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/productos", element: <ListProductos /> },
      {
        path: "/productos/mantenimiento",
        element: proteger(<MantenimientoProductos />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/productos/crear",
        element: proteger(<CrearProducto />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/productos/editar/:id",
        element: proteger(<EditarProducto />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      { path: "/productos/:id", element: <DetalleProducto /> },
      { path: "/combos", element: <ListCombos /> },
      {
        path: "/combos/mantenimiento",
        element: proteger(<MantenimientoCombos />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/combos/crear",
        element: proteger(<CrearCombo />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/combos/editar/:id",
        element: proteger(<EditarCombo />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      { path: "/combos/:id", element: <DetalleCombo /> },
      { path: "/menus", element: <ListMenus /> },
      {
        path: "/menus/mantenimiento",
        element: proteger(<MantenimientoMenus />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/menus/crear",
        element: proteger(<CrearMenu />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/menus/editar/:id",
        element: proteger(<EditarMenu />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      { path: "/menus/:id", element: <DetalleMenu /> },
      { path: "/menu-disponible", element: <MenuDisponible /> },
      { path: "/procesos", element: proteger(<ListProcesos />, ROLE_GROUPS.PREPARACION) },
      {
        path: "/procesos/mantenimiento",
        element: proteger(<MantenimientoProcesos />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/procesos/crear",
        element: proteger(<CrearProceso />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      {
        path: "/procesos/editar/:id",
        element: proteger(<EditarProceso />, ROLE_GROUPS.MANTENIMIENTO_OPERATIVO),
      },
      { path: "/procesos/:id", element: proteger(<DetalleProceso />, ROLE_GROUPS.PREPARACION) },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/user/login", element: <Login /> },
      { path: "/user/logout", element: <Logout /> },
      { path: "/user/create", element: <Signup /> },
      { path: "/user/perfil", element: proteger(<PerfilUsuario />, ROLE_GROUPS.AUTHENTICATED) },
      {
        path: "/user/perfil/editar",
        element: proteger(<EditarPerfilUsuario />, ROLE_GROUPS.AUTHENTICATED),
      },
      {
        path: "/usuarios/mantenimiento",
        element: proteger(<MantenimientoUsuarios />, ROLE_GROUPS.ADMIN),
      },
      { path: "/usuarios/crear", element: proteger(<CrearUsuario />, ROLE_GROUPS.ADMIN) },
      { path: "/usuarios/editar/:id", element: proteger(<EditarUsuario />, ROLE_GROUPS.ADMIN) },
      { path: "/usuarios/:id", element: proteger(<DetalleUsuario />, ROLE_GROUPS.ADMIN) },
      { path: "*", element: <PageNotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={rutas} />
    </UserProvider>
  </StrictMode>,
);
