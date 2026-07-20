import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MenuService from "../../services/MenuService";
import { MenuForm } from "./MenuForm";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Carga y presenta el formulario de edicion de menu. */
export function EditarMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    MenuService.getMenuById(id)
      .then((response) => setMenu(response.data))
      .catch((error) =>
        setError(error.response?.data?.error || error.message || "No se pudo cargar el menú"),
      )
      .finally(() => setLoaded(true));
  }, [id]);

  const guardarMenu = async (data) => {
    await MenuService.updateMenu(id, data);
    toast.success("Menú actualizado correctamente");
    navigate("/menus/mantenimiento");
  };

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !menu) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Menú no encontrado"}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Editar Menú
        </Typography>
      </Box>
      <MenuForm initialData={menu} onSubmit={guardarMenu} submitLabel="Guardar cambios" />
    </Container>
  );
}
