import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../../services/UserService";
import { UsuarioForm } from "./UsuarioForm";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Presenta el formulario administrativo para crear usuarios. */
export function CrearUsuario() {
  const navigate = useNavigate();

  const guardarUsuario = async (data) => {
    await UserService.createUsuario(data);
    toast.success("Usuario creado correctamente");
    navigate("/usuarios/mantenimiento");
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>Crear Usuario</Typography>
      </Box>
      <UsuarioForm onSubmit={guardarUsuario} submitLabel="Crear usuario" />
    </Container>
  );
}
