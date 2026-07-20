import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

/** Muestra el perfil administrativo de una persona. */
export function DetalleUsuario() {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    UserService.getUsuarioById(id)
      .then((response) => setUsuario(response.data))
      .catch((error) => setError(error.response?.data?.error || error.message || "No se pudo cargar el usuario"))
      .finally(() => setLoaded(true));
  }, [id]);

  if (!loaded) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="secondary" /></Box>;
  if (error || !usuario) return <Container sx={{ py: 4 }}><Alert severity="error">{error || "Usuario no encontrado"}</Alert></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Button component={Link} to="/usuarios/mantenimiento" variant="outlined" sx={{ mb: 3 }}>Volver a usuarios</Button>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar sx={{ width: 88, height: 88, bgcolor: "#E50914", fontSize: 34 }}>{usuario.name?.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>{usuario.name}</Typography>
            <Typography color="text.secondary">{usuario.email}</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
              <Chip label={usuario.rol?.name || usuario.rol || "Sin rol"} color="primary" />
              <Chip label={Number(usuario.activo) === 1 ? "Activo" : "Inactivo"} color={Number(usuario.activo) === 1 ? "success" : "default"} />
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <Typography><strong>Telefono:</strong> {usuario.telefono || "No registrado"}</Typography>
          <Typography><strong>ID:</strong> {usuario.id}</Typography>
        </Box>
      </Paper>
    </Container>
  );
}
