import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserService from "../../services/UserService";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/** Muestra el perfil del usuario autenticado. */
export function PerfilUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    UserService.getPerfil()
      .then((response) => setUsuario(response.data))
      .catch((error) =>
        setError(error.response?.data?.error || error.message || "No se pudo cargar el perfil"),
      )
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="secondary" /></Box>;

  if (error || !usuario) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Debe iniciar sesión para ver el perfil"}</Alert>
        <Button component={Link} to="/user/login" variant="contained" sx={{ mt: 2, backgroundColor: "#E50914" }}>Ir a login</Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar sx={{ width: 92, height: 92, bgcolor: "#E50914", fontSize: 36 }}>{usuario.name?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>Mi perfil</Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>{usuario.name}</Typography>
            <Typography color="text.secondary">{usuario.email}</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              <Chip label={usuario.rol?.name || "Sin rol"} color="primary" />
              <Chip label={Number(usuario.activo) === 1 ? "Activo" : "Inactivo"} color={Number(usuario.activo) === 1 ? "success" : "default"} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <Typography><strong>Telefono:</strong> {usuario.telefono || "No registrado"}</Typography>
          <Typography><strong>Rol:</strong> {usuario.rol?.name || "Sin rol"}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button component={Link} to="/user/perfil/editar" variant="contained" sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
            Editar perfil
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
