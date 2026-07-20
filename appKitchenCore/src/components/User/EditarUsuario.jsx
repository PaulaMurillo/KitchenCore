import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../../services/UserService";
import { UsuarioForm } from "./UsuarioForm";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Carga y presenta el formulario administrativo de edicion de usuario. */
export function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    UserService.getUsuarioById(id)
      .then((response) => setUsuario(response.data))
      .catch((error) => setError(error.response?.data?.error || error.message || "No se pudo cargar el usuario"))
      .finally(() => setLoaded(true));
  }, [id]);

  const guardarUsuario = async (data) => {
    await UserService.updateUsuario(id, data);
    toast.success("Usuario actualizado correctamente");
    navigate("/usuarios/mantenimiento");
  };

  if (!loaded) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="secondary" /></Box>;
  if (error || !usuario) return <Container sx={{ py: 4 }}><Alert severity="error">{error || "Usuario no encontrado"}</Alert></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>Editar Usuario</Typography>
      </Box>
      <UsuarioForm initialData={usuario} onSubmit={guardarUsuario} submitLabel="Guardar cambios" />
    </Container>
  );
}
