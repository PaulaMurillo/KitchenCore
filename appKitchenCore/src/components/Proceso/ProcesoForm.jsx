import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ProcesoService from "../../services/ProcesoService";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

const crearEstadoInicial = (proceso) => ({
  id_producto: proceso?.id ? Number(proceso.id) : "",
  estaciones: (proceso?.estaciones ?? []).map((estacion) => ({
    id_estacion: Number(estacion.id_estacion),
    nombre_estacion: estacion.nombre_estacion,
    descripcion: estacion.descripcion,
    orden_paso: Number(estacion.orden_paso),
  })),
});

/** Formulario reutilizable para crear y editar procesos de preparacion. */
export function ProcesoForm({
  initialData = null,
  onSubmit,
  submitLabel = "Guardar",
  productoBloqueado = false,
}) {
  const [form, setForm] = useState(() => crearEstadoInicial(initialData));
  const [productos, setProductos] = useState([]);
  const [estacionesDisponibles, setEstacionesDisponibles] = useState([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState("");
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("");
  const [catalogosCargando, setCatalogosCargando] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    Promise.all([ProcesoService.getProductos(), ProcesoService.getEstaciones()])
      .then(([productosResponse, estacionesResponse]) => {
        setProductos(productosResponse.data || []);
        setEstacionesDisponibles(estacionesResponse.data || []);
      })
      .catch((error) =>
        setApiError(error.response?.data?.error || error.message || "No se pudieron cargar los catalogos"),
      )
      .finally(() => setCatalogosCargando(false));
  }, []);

  const agregarEstacion = () => {
    const idEstacion = Number(estacionSeleccionada);
    const ordenPaso = Number(ordenSeleccionado);
    const estacion = estacionesDisponibles.find((item) => Number(item.id_estacion) === idEstacion);

    if (!estacion) return;
    if (!Number.isInteger(ordenPaso) || ordenPaso <= 0) {
      setErrors((current) => ({ ...current, estaciones: "Indique un orden mayor que cero" }));
      return;
    }
    if (form.estaciones.some((paso) => paso.id_estacion === idEstacion)) {
      setErrors((current) => ({ ...current, estaciones: "La estacion ya fue agregada" }));
      return;
    }
    if (form.estaciones.some((paso) => Number(paso.orden_paso) === ordenPaso)) {
      setErrors((current) => ({ ...current, estaciones: "Ya existe una estacion con ese orden" }));
      return;
    }

    setForm((current) => ({
      ...current,
      estaciones: [
        ...current.estaciones,
        {
          id_estacion: idEstacion,
          nombre_estacion: estacion.nombre_estacion,
          descripcion: estacion.descripcion,
          orden_paso: ordenPaso,
        },
      ],
    }));
    setEstacionSeleccionada("");
    setOrdenSeleccionado("");
    setErrors((current) => ({ ...current, estaciones: "" }));
  };

  const actualizarOrden = (idEstacion, ordenPaso) => {
    setForm((current) => ({
      ...current,
      estaciones: current.estaciones.map((paso) =>
        paso.id_estacion === idEstacion ? { ...paso, orden_paso: ordenPaso } : paso,
      ),
    }));
    setErrors((current) => ({ ...current, estaciones: "" }));
  };

  const quitarEstacion = (idEstacion) => {
    setForm((current) => ({
      ...current,
      estaciones: current.estaciones.filter((paso) => paso.id_estacion !== idEstacion),
    }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.id_producto) nuevosErrores.id_producto = "Seleccione un producto";
    if (form.estaciones.length === 0) {
      nuevosErrores.estaciones = "Debe agregar al menos una estacion";
    } else {
      const ordenes = form.estaciones.map((paso) => Number(paso.orden_paso));
      if (ordenes.some((orden) => !Number.isInteger(orden) || orden <= 0)) {
        nuevosErrores.estaciones = "Todos los pasos deben tener un orden mayor que cero";
      } else if (new Set(ordenes).size !== ordenes.length) {
        nuevosErrores.estaciones = "No se pueden repetir los ordenes";
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    if (!validar()) return;

    const payload = {
      id_producto: Number(form.id_producto),
      estaciones: form.estaciones.map((paso) => ({
        id_estacion: paso.id_estacion,
        orden_paso: Number(paso.orden_paso),
      })),
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || "No se pudo guardar el proceso");
      setSubmitting(false);
    }
  };

  if (catalogosCargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 } }}>
      {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Producto del proceso
      </Typography>

      <FormControl required error={Boolean(errors.id_producto)} fullWidth sx={{ mb: 4 }}>
        <InputLabel id="producto-proceso-label">Producto</InputLabel>
        <Select
          labelId="producto-proceso-label"
          label="Producto"
          value={form.id_producto}
          disabled={productoBloqueado}
          onChange={(event) => {
            setForm((current) => ({ ...current, id_producto: event.target.value }));
            setErrors((current) => ({ ...current, id_producto: "" }));
          }}
        >
          {productos.map((producto) => (
            <MenuItem key={producto.id} value={Number(producto.id)}>
              {producto.nombre}
            </MenuItem>
          ))}
        </Select>
        {errors.id_producto && (
          <Typography variant="caption" color="error" sx={{ ml: 1.75, mt: 0.5 }}>
            {errors.id_producto}
          </Typography>
        )}
      </FormControl>

      <Box sx={{ pt: 3, borderTop: "3px solid #E50914" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Estaciones de cocina
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto" }, gap: 2, alignItems: "center", mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="estacion-proceso-label">Estacion</InputLabel>
            <Select
              labelId="estacion-proceso-label"
              label="Estacion"
              value={estacionSeleccionada}
              onChange={(event) => setEstacionSeleccionada(event.target.value)}
            >
              {estacionesDisponibles
                .filter(
                  (estacion) =>
                    !form.estaciones.some((paso) => paso.id_estacion === Number(estacion.id_estacion)),
                )
                .map((estacion) => (
                  <MenuItem key={estacion.id_estacion} value={estacion.id_estacion}>
                    {estacion.nombre_estacion}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Orden"
            type="number"
            value={ordenSeleccionado}
            onChange={(event) => setOrdenSeleccionado(event.target.value)}
            inputProps={{ min: 1, step: 1 }}
          />
          <Button
            type="button"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!estacionSeleccionada || !ordenSeleccionado}
            onClick={agregarEstacion}
            sx={{ backgroundColor: "#0B0B0B", "&:hover": { backgroundColor: "#E50914" } }}
          >
            Agregar
          </Button>
        </Box>

        {[...form.estaciones]
          .sort((pasoA, pasoB) => Number(pasoA.orden_paso) - Number(pasoB.orden_paso))
          .map((paso) => (
            <Box
              key={paso.id_estacion}
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr auto", md: "110px 1fr 2fr auto" }, gap: 2, alignItems: "center", p: 2, mb: 1.5, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.04)" }}
            >
              <TextField
                label="Paso"
                type="number"
                size="small"
                value={paso.orden_paso}
                onChange={(event) => actualizarOrden(paso.id_estacion, event.target.value)}
                inputProps={{ min: 1, step: 1 }}
              />
              <Typography sx={{ fontWeight: 800 }}>{paso.nombre_estacion}</Typography>
              <Typography variant="body2" color="text.secondary">{paso.descripcion}</Typography>
              <Tooltip title="Quitar estacion">
                <IconButton type="button" color="error" onClick={() => quitarEstacion(paso.id_estacion)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

        {errors.estaciones && <Alert severity="error" sx={{ mt: 2 }}>{errors.estaciones}</Alert>}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Button component={Link} to="/procesos/mantenimiento" variant="outlined">Cancelar</Button>
        <Button type="submit" variant="contained" disabled={submitting} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </Box>
    </Paper>
  );
}

ProcesoForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    estaciones: PropTypes.arrayOf(PropTypes.object),
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  productoBloqueado: PropTypes.bool,
};
