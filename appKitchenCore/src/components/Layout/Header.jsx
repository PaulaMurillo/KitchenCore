import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import AccountCircle from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";

import { UserContext } from "../../context/UserContext";
import logoKitchenCore from "../../assets/kitchencore-logo.png";

export default function Header() {
  const { user, decodeToken, autorize } = useContext(UserContext);
  const [userData, setUserData] = useState(decodeToken());

  useEffect(() => {
    setUserData(decodeToken());
  }, [user]);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElPrincipal, setAnchorElPrincipal] = useState(null);
  const [mobileOpcionesAnchorEl, setMobileOpcionesAnchorEl] = useState(null);

  const isMobileOpcionesMenuOpen = Boolean(mobileOpcionesAnchorEl);

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
    handleOpcionesMenuClose();
  };

  const handleOpenPrincipalMenu = (event) => {
    setAnchorElPrincipal(event.currentTarget);
  };

  const handleClosePrincipalMenu = () => {
    setAnchorElPrincipal(null);
  };

  const handleOpcionesMenuOpen = (event) => {
    setMobileOpcionesAnchorEl(event.currentTarget);
  };

  const handleOpcionesMenuClose = () => {
    setMobileOpcionesAnchorEl(null);
  };

  const userItems = [
    { name: "Iniciar sesión", link: "/user/login", login: false },
    { name: "Registrarse", link: "/user/create", login: false },
    { name: "Cerrar sesión", link: "/user/logout", login: true },
  ];

  const navItems = [
    { name: "Productos", link: "/productos", roles: null },
    { name: "Combos", link: "/combos", roles: null },
    { name: "Menús", link: "/menus", roles: null },
    { name: "Menú disponible", link: "/menu-disponible", roles: null },
    { name: "Preparación", link: "/procesos", roles: null },
  ];

  const canShowItem = (item) => {
    if (item.roles === null) return true;
    if (!userData || Object.keys(userData).length === 0) return false;
    return autorize({ requiredRoles: item.roles });
  };

  const visibleNavItems = navItems.filter(canShowItem);

  const menuIdPrincipal = "menu-principal-kitchencore";
  const userMenuId = "user-menu-kitchencore";
  const menuOpcionesId = "menu-opciones-kitchencore";

  const isLogged = userData && Object.keys(userData).length > 0;

  const menuPrincipalMobile = visibleNavItems.map((item) => (
    <MenuItem
      key={item.link}
      component={Link}
      to={item.link}
      onClick={handleClosePrincipalMenu}
    >
      <Typography>{item.name}</Typography>
    </MenuItem>
  ));

  const userMenu = (
    <Box>
      <IconButton
        size="large"
        edge="end"
        aria-label="usuario actual"
        aria-controls={userMenuId}
        aria-haspopup="true"
        onClick={handleUserMenuOpen}
        sx={{
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,0.24)",
          backgroundColor: "rgba(255,255,255,0.08)",
          "&:hover": {
            backgroundColor: "#E50914",
            borderColor: "#E50914",
          },
        }}
      >
        <AccountCircle />
      </IconButton>

      <Menu
        id={userMenuId}
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {isLogged && (
          <MenuItem>
            <Box>
              <Typography variant="subtitle2">Usuario activo</Typography>
              <Typography variant="body2" color="text.secondary">
                {userData?.email}
              </Typography>
            </Box>
          </MenuItem>
        )}

        {userItems.map((item) => {
          if (item.login && isLogged) {
            return (
              <MenuItem
                key={item.link}
                component={Link}
                to={item.link}
                onClick={handleUserMenuClose}
              >
                {item.name}
              </MenuItem>
            );
          }

          if (!item.login && !isLogged) {
            return (
              <MenuItem
                key={item.link}
                component={Link}
                to={item.link}
                onClick={handleUserMenuClose}
              >
                {item.name}
              </MenuItem>
            );
          }

          return null;
        })}
      </Menu>
    </Box>
  );

  const menuOpcionesMobile = (
    <Menu
      anchorEl={mobileOpcionesAnchorEl}
      id={menuOpcionesId}
      open={isMobileOpcionesMenuOpen}
      onClose={handleOpcionesMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleOpcionesMenuClose}>
        <IconButton size="large">
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Typography>Notificaciones</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "#0B0B0B",
          borderBottom: "4px solid #E50914",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 76, md: 88 },
            gap: 2,
            px: { xs: 2, md: 4 },
          }}
        >
          <IconButton
            size="large"
            aria-controls={menuIdPrincipal}
            aria-haspopup="true"
            sx={{
              display: { xs: "flex", md: "none" },
              color: "#ffffff",
            }}
            onClick={handleOpenPrincipalMenu}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            id={menuIdPrincipal}
            anchorEl={anchorElPrincipal}
            open={Boolean(anchorElPrincipal)}
            onClose={handleClosePrincipalMenu}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            {menuPrincipalMobile}
          </Menu>

          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              mr: { xs: 1, md: 3 },
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={logoKitchenCore}
              alt="KitchenCore"
              sx={{
                height: { xs: 52, md: 66 },
                width: "auto",
                maxWidth: { xs: 190, md: 260 },
                objectFit: "contain",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                px: 1.2,
                py: 0.8,
                boxShadow: "0 8px 22px rgba(229, 9, 20, 0.32)",
              }}
            />
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.6,
              flexGrow: 1,
              overflow: "hidden",
            }}
          >
            {visibleNavItems.map((item) => (
              <Button
                key={item.link}
                component={Link}
                to={item.link}
                sx={{
                  color: "#ffffff",
                  fontWeight: 800,
                  borderRadius: "999px",
                  px: 2,
                  py: 1,
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#E50914",
                    color: "#ffffff",
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            <IconButton
              sx={{
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.24)",
                backgroundColor: "rgba(255,255,255,0.08)",
                "&:hover": {
                  backgroundColor: "#E50914",
                  borderColor: "#E50914",
                },
              }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>

          {userMenu}

          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="mostrar más opciones"
              aria-controls={menuOpcionesId}
              aria-haspopup="true"
              onClick={handleOpcionesMenuOpen}
              sx={{ color: "#ffffff" }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {menuOpcionesMobile}
    </Box>
  );
}
