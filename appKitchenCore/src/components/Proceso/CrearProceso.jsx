import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProcesoService from "../../services/ProcesoService";
import { ProcesoForm } from "./ProcesoForm";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Presenta el formulario para registrar un proceso. */
export function CrearProceso() {
  const navigate = useNavigate();

  const guardarProceso = async (data) => {
    await ProcesoService.createProceso(data);
    toast.success("Proceso creado correctamente");
    navigate("/procesos/mantenimiento");
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Crear Proceso
        </Typography>
      </Box>
      <ProcesoForm onSubmit={guardarProceso} submitLabel="Crear proceso" />
    </Container>
  );
}
