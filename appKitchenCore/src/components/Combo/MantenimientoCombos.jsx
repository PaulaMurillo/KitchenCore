import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ComboService from "../../services/ComboService";
import { getImageUrl } from "../../utils/getImageUrl";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

/** Presenta el mantenimiento completo de combos. */
export function MantenimientoCombos() {
  const [combos, setCombos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const comboFallback = "/uploads/default-combo.jpg";

  const cargarCombos = useCallback(async () => {
    try {
      setError("");
      const response = await ComboService.getCombosMantenimiento();
      setCombos(response.data || []);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudieron cargar los combos");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    cargarCombos();
  }, [cargarCombos]);

  const ejecutarCambioEstado = async () => {
    if (!confirmacion) return;
    const { combo, accion } = confirmacion;

    try {
      setProcesando(true);
      if (accion === "desactivar") {
        await ComboService.deleteCombo(combo.id);
        toast.success("Combo desactivado correctamente");
      } else {
        await ComboService.activarCombo(combo.id);
        toast.success("Combo activado correctamente");
      }
      setConfirmacion(null);
      await cargarCombos();
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudo cambiar el estado");
    } finally {
      setProcesando(false);
    }
  };

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
          Mantenimiento de Combos
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
          Cree, edite, active o desactive combos.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button component={Link} to="/combos/crear" variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          Nuevo Combo
        </Button>
        <Button component={Link} to="/combos" variant="outlined">
          Ver listado publico
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
        <Table aria-label="Mantenimiento de combos">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0B0B0B" }}>
              {["ID", "Imagen", "Nombre", "Precio", "Productos", "Estado", "Acciones"].map((columna) => (
                <TableCell key={columna} sx={{ color: "#FFFFFF", fontWeight: 800 }}>{columna}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {combos.map((combo) => {
              const activo = Number(combo.activo) === 1;
              return (
                <TableRow key={combo.id} hover>
                  <TableCell>{combo.id}</TableCell>
                  <TableCell>
                    <Avatar
                      src={getImageUrl(combo.imagen_url, comboFallback)}
                      alt={combo.nombre}
                      variant="rounded"
                      imgProps={{
                        onError: (event) => {
                          event.currentTarget.src = comboFallback;
                        },
                      }}
                      sx={{ width: 64, height: 64, bgcolor: "#F5F5F5" }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{combo.nombre}</TableCell>
                  <TableCell>₡{Number(combo.precio_especial).toLocaleString("es-CR")}</TableCell>
                  <TableCell><Chip label={`${combo.cantidad_productos} productos`} size="small" /></TableCell>
                  <TableCell><Chip label={activo ? "Activo" : "Inactivo"} color={activo ? "success" : "default"} size="small" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button component={Link} to={`/combos/${combo.id}`} variant="outlined" size="small" startIcon={<VisibilityIcon />}>Ver</Button>
                      <Button component={Link} to={`/combos/editar/${combo.id}`} variant="outlined" size="small" startIcon={<EditIcon />}>Editar</Button>
                      <Button variant="contained" size="small" color={activo ? "error" : "success"} onClick={() => setConfirmacion({ combo, accion: activo ? "desactivar" : "activar" })}>
                        {activo ? "Desactivar" : "Activar"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {combos.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No hay combos registrados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(confirmacion)} onClose={() => !procesando && setConfirmacion(null)}>
        <DialogTitle>{confirmacion?.accion === "desactivar" ? "Desactivar combo" : "Activar combo"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea {confirmacion?.accion} el combo {confirmacion?.combo.nombre}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmacion(null)} disabled={procesando}>Cancelar</Button>
          <Button onClick={ejecutarCambioEstado} disabled={procesando} variant="contained" color={confirmacion?.accion === "desactivar" ? "error" : "success"}>
            {procesando ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
