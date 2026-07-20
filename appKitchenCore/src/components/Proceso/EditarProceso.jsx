import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProcesoService from "../../services/ProcesoService";
import { ProcesoForm } from "./ProcesoForm";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Carga y presenta el formulario de edicion del proceso. */
export function EditarProceso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proceso, setProceso] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ProcesoService.getProcesoById(id)
      .then((response) => setProceso(response.data))
      .catch((error) =>
        setError(error.response?.data?.error || error.message || "No se pudo cargar el proceso"),
      )
      .finally(() => setLoaded(true));
  }, [id]);

  const guardarProceso = async (data) => {
    await ProcesoService.updateProceso(id, data);
    toast.success("Proceso actualizado correctamente");
    navigate("/procesos/mantenimiento");
  };

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !proceso) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Proceso no encontrado"}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Editar Proceso
        </Typography>
      </Box>
      <ProcesoForm initialData={proceso} onSubmit={guardarProceso} submitLabel="Guardar cambios" productoBloqueado />
    </Container>
  );
}
