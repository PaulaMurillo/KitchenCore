import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ComboService from "../../services/ComboService";
import { ComboForm } from "./ComboForm";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Presenta el formulario para registrar un combo. */
export function CrearCombo() {
  const navigate = useNavigate();

  const guardarCombo = async (data) => {
    await ComboService.createCombo(data);
    toast.success("Combo creado correctamente");
    navigate("/combos/mantenimiento");
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Crear Combo
        </Typography>
      </Box>
      <ComboForm onSubmit={guardarCombo} submitLabel="Crear combo" />
    </Container>
  );
}
