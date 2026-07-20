export const ROLES = {
  CLIENTE: "Cliente",
  ENCARGADO: "Encargado",
  COCINA: "Cocina",
  ADMINISTRADOR: "Administrador",
};

export const ROLE_GROUPS = {
  AUTHENTICATED: [ROLES.CLIENTE, ROLES.ENCARGADO, ROLES.COCINA, ROLES.ADMINISTRADOR],
  CATALOG: [ROLES.CLIENTE, ROLES.ENCARGADO, ROLES.ADMINISTRADOR],
  PREPARACION: [ROLES.COCINA, ROLES.ENCARGADO, ROLES.ADMINISTRADOR],
  MANTENIMIENTO_OPERATIVO: [ROLES.ENCARGADO, ROLES.ADMINISTRADOR],
  ADMIN: [ROLES.ADMINISTRADOR],
};

export const NAV_ITEMS = [
  { name: "Productos", link: "/productos", roles: null },
  { name: "Combos", link: "/combos", roles: null },
  { name: "Menús", link: "/menus", roles: null },
  { name: "Menú disponible", link: "/menu-disponible", roles: null },
  { name: "Preparacion", link: "/procesos", roles: ROLE_GROUPS.PREPARACION },
];

export const MANTENIMIENTO_ITEMS = [
  {
    name: "Productos",
    link: "/productos/mantenimiento",
    roles: ROLE_GROUPS.MANTENIMIENTO_OPERATIVO,
  },
  {
    name: "Combos",
    link: "/combos/mantenimiento",
    roles: ROLE_GROUPS.MANTENIMIENTO_OPERATIVO,
  },
  {
    name: "Procesos de preparacion",
    link: "/procesos/mantenimiento",
    roles: ROLE_GROUPS.MANTENIMIENTO_OPERATIVO,
  },
  {
    name: "Menús",
    link: "/menus/mantenimiento",
    roles: ROLE_GROUPS.MANTENIMIENTO_OPERATIVO,
  },
  {
    name: "Usuarios",
    link: "/usuarios/mantenimiento",
    roles: ROLE_GROUPS.ADMIN,
  },
];
