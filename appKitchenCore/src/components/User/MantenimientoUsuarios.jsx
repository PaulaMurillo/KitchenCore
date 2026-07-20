import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../../services/UserService";

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

/** Presenta el mantenimiento administrativo de usuarios. */
export function MantenimientoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      setError("");
      const response = await UserService.getUsuariosMantenimiento();
      setUsuarios(response.data || []);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudieron cargar los usuarios");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const ejecutarCambioEstado = async () => {
    if (!confirmacion) return;
    const { usuario, accion } = confirmacion;

    try {
      setProcesando(true);
      if (accion === "desactivar") {
        await UserService.deleteUsuario(usuario.id);
        toast.success("Usuario desactivado correctamente");
      } else {
        await UserService.activarUsuario(usuario.id);
        toast.success("Usuario activado correctamente");
      }
      setConfirmacion(null);
      await cargarUsuarios();
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudo cambiar el estado");
    } finally {
      setProcesando(false);
    }
  };

  if (!loaded) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="secondary" /></Box>;

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3, p: { xs: 2.5, md: 3.5 }, borderRadius: 3, backgroundColor: "#0B0B0B", color: "#FFFFFF", borderBottom: "5px solid #E50914" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>Mantenimiento de Usuarios</Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>Cree, edite, active o desactive usuarios.</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button component={Link} to="/usuarios/crear" variant="contained" startIcon={<AddIcon />} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          Nuevo Usuario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
        <Table aria-label="Mantenimiento de usuarios">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0B0B0B" }}>
              {["ID", "Nombre completo", "Correo", "Telefono", "Rol", "Estado", "Acciones"].map((columna) => (
                <TableCell key={columna} sx={{ color: "#FFFFFF", fontWeight: 800 }}>{columna}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => {
              const activo = Number(usuario.activo) === 1;
              return (
                <TableRow key={usuario.id} hover>
                  <TableCell>{usuario.id}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{usuario.name}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.telefono || "No registrado"}</TableCell>
                  <TableCell><Chip label={usuario.rol} size="small" color="primary" /></TableCell>
                  <TableCell><Chip label={activo ? "Activo" : "Inactivo"} size="small" color={activo ? "success" : "default"} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button component={Link} to={`/usuarios/${usuario.id}`} variant="outlined" size="small" startIcon={<VisibilityIcon />}>Ver</Button>
                      <Button component={Link} to={`/usuarios/editar/${usuario.id}`} variant="outlined" size="small" startIcon={<EditIcon />}>Editar</Button>
                      <Button variant="contained" size="small" color={activo ? "error" : "success"} onClick={() => setConfirmacion({ usuario, accion: activo ? "desactivar" : "activar" })}>
                        {activo ? "Desactivar" : "Activar"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {usuarios.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No hay usuarios registrados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(confirmacion)} onClose={() => !procesando && setConfirmacion(null)}>
        <DialogTitle>{confirmacion?.accion === "desactivar" ? "Desactivar usuario" : "Activar usuario"}</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Desea {confirmacion?.accion} el usuario {confirmacion?.usuario.name}?</DialogContentText>
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
