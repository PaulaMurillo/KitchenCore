import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MenuService from "../../services/MenuService";
import { MenuForm } from "./MenuForm";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Presenta el formulario para registrar un menu. */
export function CrearMenu() {
  const navigate = useNavigate();

  const guardarMenu = async (data) => {
    await MenuService.createMenu(data);
    toast.success("Menú creado correctamente");
    navigate("/menus/mantenimiento");
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Crear Menú
        </Typography>
      </Box>
      <MenuForm onSubmit={guardarMenu} submitLabel="Crear menú" />
    </Container>
  );
}
