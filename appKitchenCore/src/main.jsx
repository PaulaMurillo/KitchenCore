import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./components/Home/Home";
import { PageNotFound } from "./components/Home/PageNotFound";

import UserProvider from "./components/User/UserProvider";
import { Unauthorized } from "./components/User/Unauthorized";
import { Login } from "./components/User/Login";
import { Logout } from "./components/User/Logout";
import { Signup } from "./components/User/Signup";

import { ListProductos } from "./components/Producto/ListProductos";
import { DetalleProducto } from "./components/Producto/DetalleProducto";

import { ListCombos } from "./components/Combo/ListCombos";
import { DetalleCombo } from "./components/Combo/DetalleCombo";

import { ListMenus } from "./components/Menu/ListMenus";
import { MenuDisponible } from "./components/Menu/MenuDisponible";

import { ListProcesos } from "./components/Proceso/ListProcesos";
import { DetalleProceso } from "./components/Proceso/DetalleProceso";

const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/productos", element: <ListProductos /> },
      { path: "/productos/:id", element: <DetalleProducto /> },
      { path: "/combos", element: <ListCombos /> },
      { path: "/combos/:id", element: <DetalleCombo /> },
      { path: "/menus", element: <ListMenus /> },
      { path: "/menu-disponible", element: <MenuDisponible /> },
      { path: "/procesos", element: <ListProcesos /> },
      { path: "/procesos/:id", element: <DetalleProceso /> },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "/user/login", element: <Login /> },
      { path: "/user/logout", element: <Logout /> },
      { path: "/user/create", element: <Signup /> },
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
