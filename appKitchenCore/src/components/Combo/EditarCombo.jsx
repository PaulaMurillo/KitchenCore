import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ComboService from "../../services/ComboService";
import { ComboForm } from "./ComboForm";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Carga y presenta el formulario de edicion de combo. */
export function EditarCombo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ComboService.getComboById(id)
      .then((response) => setCombo(response.data))
      .catch((error) =>
        setError(error.response?.data?.error || error.message || "No se pudo cargar el combo"),
      )
      .finally(() => setLoaded(true));
  }, [id]);

  const guardarCombo = async (data) => {
    await ComboService.updateCombo(id, data);
    toast.success("Combo actualizado correctamente");
    navigate("/combos/mantenimiento");
  };

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !combo) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Combo no encontrado"}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Editar Combo
        </Typography>
      </Box>
      <ComboForm initialData={combo} onSubmit={guardarCombo} submitLabel="Guardar cambios" />
    </Container>
  );
}
