import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import MenuService from "../../services/MenuService";
import { formatearRangoFechas, formatearRangoHoras } from "../../utils/formatters";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Alert from "@mui/material/Alert";
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

/** Presenta el mantenimiento completo de menús. */
export function MantenimientoMenus() {
  const [menus, setMenus] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargarMenus = useCallback(async () => {
    try {
      setError("");
      const response = await MenuService.getMenusMantenimiento();
      setMenus(response.data || []);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudieron cargar los menús");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    cargarMenus();
  }, [cargarMenus]);

  const ejecutarCambioEstado = async () => {
    if (!confirmacion) return;
    const { menu, accion } = confirmacion;

    try {
      setProcesando(true);
      if (accion === "desactivar") {
        await MenuService.deleteMenu(menu.id);
        toast.success("Menú desactivado correctamente");
      } else {
        await MenuService.activarMenu(menu.id);
        toast.success("Menú activado correctamente");
      }
      setConfirmacion(null);
      await cargarMenus();
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
          Mantenimiento de Menús
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
          Cree, edite, active o desactive menús.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button component={Link} to="/menus/crear" variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          Nuevo Menú
        </Button>
        <Button component={Link} to="/menu-disponible" variant="outlined">Ver menú disponible</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
        <Table aria-label="Mantenimiento de menús">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0B0B0B" }}>
              {["ID", "Nombre", "Fechas", "Horario", "Estado", "Productos", "Combos", "Acciones"].map((columna) => (
                <TableCell key={columna} sx={{ color: "#FFFFFF", fontWeight: 800 }}>{columna}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {menus.map((menu) => {
              const activo = Number(menu.activo) === 1;
              return (
                <TableRow key={menu.id} hover>
                  <TableCell>{menu.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{menu.nombre}</TableCell>
                  <TableCell>{formatearRangoFechas(menu.fecha_inicio, menu.fecha_fin)}</TableCell>
                  <TableCell>{formatearRangoHoras(menu.hora_inicio, menu.hora_fin)}</TableCell>
                  <TableCell><Chip label={activo ? "Activo" : "Inactivo"} color={activo ? "success" : "default"} size="small" /></TableCell>
                  <TableCell><Chip label={`${menu.cantidad_productos} productos`} size="small" /></TableCell>
                  <TableCell><Chip label={`${menu.cantidad_combos} combos`} size="small" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button component={Link} to={`/menus/${menu.id}`} variant="outlined" size="small" startIcon={<VisibilityIcon />}>Ver</Button>
                      <Button component={Link} to={`/menus/editar/${menu.id}`} variant="outlined" size="small" startIcon={<EditIcon />}>Editar</Button>
                      <Button variant="contained" size="small" color={activo ? "error" : "success"} onClick={() => setConfirmacion({ menu, accion: activo ? "desactivar" : "activar" })}>
                        {activo ? "Desactivar" : "Activar"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {menus.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}>No hay menús registrados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(confirmacion)} onClose={() => !procesando && setConfirmacion(null)}>
        <DialogTitle>{confirmacion?.accion === "desactivar" ? "Desactivar menú" : "Activar menú"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea {confirmacion?.accion} el menú {confirmacion?.menu.nombre}?
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
