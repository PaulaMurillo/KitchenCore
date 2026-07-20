import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProcesoService from "../../services/ProcesoService";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

/** Presenta el mantenimiento de procesos de preparacion. */
export function MantenimientoProcesos() {
  const [procesos, setProcesos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const cargarProcesos = useCallback(async () => {
    try {
      setError("");
      const response = await ProcesoService.getProcesosMantenimiento();
      setProcesos(response.data || []);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudieron cargar los procesos");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    cargarProcesos();
  }, [cargarProcesos]);

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: { xs: 2.5, md: 3.5 }, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Mantenimiento de Procesos
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
          Configure las estaciones de preparacion por producto.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button component={Link} to="/procesos/crear" variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          Nuevo Proceso
        </Button>
        <Button component={Link} to="/procesos" variant="outlined">
          Ver listado publico
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
        <Table aria-label="Mantenimiento de procesos">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0B0B0B" }}>
              {["Producto", "Pasos", "Estado", "Acciones"].map((columna) => (
                <TableCell key={columna} sx={{ color: "#FFFFFF", fontWeight: 800 }}>{columna}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {procesos.map((proceso) => (
              <TableRow key={proceso.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{proceso.producto}</TableCell>
                <TableCell><Chip label={`${proceso.cantidad_pasos} pasos`} size="small" color={Number(proceso.cantidad_pasos) > 0 ? "primary" : "default"} /></TableCell>
                <TableCell><Chip label={proceso.estado_configuracion} size="small" color={Number(proceso.cantidad_pasos) > 0 ? "success" : "warning"} /></TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button component={Link} to={`/procesos/${proceso.id}`} variant="outlined" size="small" startIcon={<VisibilityIcon />}>Ver</Button>
                    <Button component={Link} to={`/procesos/editar/${proceso.id}`} variant="outlined" size="small" startIcon={<EditIcon />}>Editar</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {procesos.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}>No hay procesos registrados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
