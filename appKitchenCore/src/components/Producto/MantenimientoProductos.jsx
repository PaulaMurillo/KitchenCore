import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ProductoService from "../../services/ProductoService";
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
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

/** Presenta el mantenimiento completo de productos activos e inactivos. */
export function MantenimientoProductos() {
  const [productos, setProductos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const cargarProductos = useCallback(async () => {
    try {
      setError("");
      const response = await ProductoService.getProductosMantenimiento();
      setProductos(response.data || []);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudieron cargar los productos");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const abrirConfirmacion = (producto, accion) => {
    setConfirmacion({ producto, accion });
  };

  const ejecutarCambioEstado = async () => {
    if (!confirmacion) return;

    const { producto, accion } = confirmacion;

    try {
      setProcesando(true);

      if (accion === "desactivar") {
        await ProductoService.deleteProducto(producto.id);
        toast.success("Producto desactivado correctamente");
      } else {
        await ProductoService.activarProducto(producto.id);
        toast.success("Producto activado correctamente");
      }

      setConfirmacion(null);
      await cargarProductos();
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
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          backgroundColor: "#0B0B0B",
          color: "#FFFFFF",
          borderBottom: "5px solid #E50914",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Mantenimiento de Productos
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
          Cree, edite, active o desactive productos.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          component={Link}
          to="/productos/crear"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}
        >
          Nuevo Producto
        </Button>
        <Button component={Link} to="/productos" variant="outlined">
          Ver listado público
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
        <Table aria-label="Mantenimiento de productos">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0B0B0B" }}>
              {[
                "ID",
                "Imagen",
                "Producto",
                "Categoría",
                "Precio",
                "Ingredientes",
                "Pasos",
                "Estado",
                "Acciones",
              ].map((columna) => (
                  <TableCell key={columna} sx={{ color: "#FFFFFF", fontWeight: 800 }}>
                    {columna}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {productos.map((producto) => {
              const activo = Number(producto.activo) === 1;

              return (
                <TableRow key={producto.id} hover>
                  <TableCell>{producto.id}</TableCell>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={getImageUrl(producto.imagen_url)}
                      alt={producto.nombre}
                      sx={{ width: 58, height: 58, bgcolor: "#FFFFFF" }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{producto.nombre}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell>₡{Number(producto.precio).toLocaleString("es-CR")}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${producto.cantidad_ingredientes} ingredientes`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        Number(producto.cantidad_pasos) > 0
                          ? `${producto.cantidad_pasos} pasos`
                          : "Sin proceso"
                      }
                      size="small"
                      color={Number(producto.cantidad_pasos) > 0 ? "secondary" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activo ? "Activo" : "Inactivo"}
                      color={activo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Tooltip title="Ver detalle">
                        <Button
                          component={Link}
                          to={`/productos/${producto.id}`}
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                        >
                          Ver
                        </Button>
                      </Tooltip>

                      <Tooltip title="Editar producto">
                        <Button
                          component={Link}
                          to={`/productos/editar/${producto.id}`}
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                        >
                          Editar
                        </Button>
                      </Tooltip>

                      <Button
                        variant="contained"
                        size="small"
                        color={activo ? "error" : "success"}
                        onClick={() =>
                          abrirConfirmacion(producto, activo ? "desactivar" : "activar")
                        }
                      >
                        {activo ? "Desactivar" : "Activar"}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {productos.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  No hay productos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(confirmacion)} onClose={() => !procesando && setConfirmacion(null)}>
        <DialogTitle>
          {confirmacion?.accion === "desactivar" ? "Desactivar producto" : "Activar producto"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Desea {confirmacion?.accion} el producto “{confirmacion?.producto.nombre}”?
            {confirmacion?.accion === "desactivar" &&
              " El registro y sus relaciones se conservarán."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmacion(null)} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            onClick={ejecutarCambioEstado}
            disabled={procesando}
            variant="contained"
            color={confirmacion?.accion === "desactivar" ? "error" : "success"}
          >
            {procesando ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
