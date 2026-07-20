import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MenuService from "../../services/MenuService";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const normalizarHoraInput = (hora) => (hora ? String(hora).slice(0, 5) : "");

const crearEstadoInicial = (menu) => ({
  nombre: menu?.nombre ?? "",
  fecha_inicio: menu?.fecha_inicio ?? "",
  fecha_fin: menu?.fecha_fin ?? "",
  hora_inicio: normalizarHoraInput(menu?.hora_inicio),
  hora_fin: normalizarHoraInput(menu?.hora_fin),
  activo: menu ? Number(menu.activo) === 1 : true,
  productos: (menu?.productos ?? []).map((producto) => Number(producto.id)),
  combos: (menu?.combos ?? []).map((combo) => Number(combo.id)),
});

/** Formulario reutilizable para crear y editar menús. */
export function MenuForm({ initialData = null, onSubmit, submitLabel = "Guardar" }) {
  const [form, setForm] = useState(() => crearEstadoInicial(initialData));
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [combosDisponibles, setCombosDisponibles] = useState([]);
  const [catalogosCargando, setCatalogosCargando] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    Promise.all([MenuService.getProductos(), MenuService.getCombos()])
      .then(([productosResponse, combosResponse]) => {
        setProductosDisponibles(productosResponse.data || []);
        setCombosDisponibles(combosResponse.data || []);
      })
      .catch((error) =>
        setApiError(error.response?.data?.error || error.message || "No se pudieron cargar los catalogos"),
      )
      .finally(() => setCatalogosCargando(false));
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const alternarSeleccion = (campo, id) => {
    setForm((current) => {
      const existe = current[campo].includes(id);
      return {
        ...current,
        [campo]: existe ? current[campo].filter((item) => item !== id) : [...current[campo], id],
      };
    });
    setErrors((current) => ({ ...current, items: "" }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es requerido";
    if (!form.fecha_inicio) nuevosErrores.fecha_inicio = "La fecha de inicio es requerida";
    if (!form.fecha_fin) nuevosErrores.fecha_fin = "La fecha de fin es requerida";
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin) {
      nuevosErrores.fecha_fin = "La fecha final debe ser igual o posterior a la inicial";
    }
    if (!form.hora_inicio) nuevosErrores.hora_inicio = "La hora de inicio es requerida";
    if (!form.hora_fin) nuevosErrores.hora_fin = "La hora de fin es requerida";
    if (
      form.fecha_inicio &&
      form.fecha_fin &&
      form.fecha_inicio === form.fecha_fin &&
      form.hora_inicio &&
      form.hora_fin &&
      form.hora_inicio >= form.hora_fin
    ) {
      nuevosErrores.hora_fin = "La hora final debe ser mayor que la hora inicial";
    }
    if (form.productos.length === 0 && form.combos.length === 0) {
      nuevosErrores.items = "Debe seleccionar al menos un producto o un combo";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    if (!validar()) return;

    const payload = {
      nombre: form.nombre.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      hora_inicio: `${form.hora_inicio}:00`,
      hora_fin: `${form.hora_fin}:00`,
      activo: form.activo ? 1 : 0,
      productos: form.productos,
      combos: form.combos,
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || "No se pudo guardar el menú");
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
        Datos del menú
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        <TextField name="nombre" label="Nombre" value={form.nombre} onChange={handleFieldChange} required error={Boolean(errors.nombre)} helperText={errors.nombre} fullWidth />
        <FormControlLabel
          control={
            <Switch
              checked={form.activo}
              onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
              color="success"
            />
          }
          label={form.activo ? "Menú activo" : "Menú inactivo"}
        />
        <TextField name="fecha_inicio" label="Fecha de inicio" type="date" value={form.fecha_inicio} onChange={handleFieldChange} required error={Boolean(errors.fecha_inicio)} helperText={errors.fecha_inicio} InputLabelProps={{ shrink: true }} fullWidth />
        <TextField name="fecha_fin" label="Fecha de fin" type="date" value={form.fecha_fin} onChange={handleFieldChange} required error={Boolean(errors.fecha_fin)} helperText={errors.fecha_fin} InputLabelProps={{ shrink: true }} fullWidth />
        <TextField name="hora_inicio" label="Hora de inicio" type="time" value={form.hora_inicio} onChange={handleFieldChange} required error={Boolean(errors.hora_inicio)} helperText={errors.hora_inicio} InputLabelProps={{ shrink: true }} fullWidth />
        <TextField name="hora_fin" label="Hora de fin" type="time" value={form.hora_fin} onChange={handleFieldChange} required error={Boolean(errors.hora_fin)} helperText={errors.hora_fin} InputLabelProps={{ shrink: true }} fullWidth />
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: "3px solid #E50914" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Productos incluidos
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
          {productosDisponibles.map((producto) => (
            <FormControlLabel
              key={producto.id}
              control={
                <Checkbox
                  checked={form.productos.includes(Number(producto.id))}
                  onChange={() => alternarSeleccion("productos", Number(producto.id))}
                />
              }
              label={`${producto.nombre} - ${producto.categoria} - ₡${Number(producto.precio).toLocaleString("es-CR")}`}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: "3px solid #E50914" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Combos incluidos
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
          {combosDisponibles.map((combo) => (
            <FormControlLabel
              key={combo.id}
              control={
                <Checkbox
                  checked={form.combos.includes(Number(combo.id))}
                  onChange={() => alternarSeleccion("combos", Number(combo.id))}
                />
              }
              label={`${combo.nombre} - ₡${Number(combo.precio_especial).toLocaleString("es-CR")}`}
            />
          ))}
        </Box>
        {errors.items && <Alert severity="error" sx={{ mt: 2 }}>{errors.items}</Alert>}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Button component={Link} to="/menus/mantenimiento" variant="outlined">Cancelar</Button>
        <Button type="submit" variant="contained" disabled={submitting} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </Box>
    </Paper>
  );
}

MenuForm.propTypes = {
  initialData: PropTypes.shape({
    nombre: PropTypes.string,
    fecha_inicio: PropTypes.string,
    fecha_fin: PropTypes.string,
    hora_inicio: PropTypes.string,
    hora_fin: PropTypes.string,
    activo: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    productos: PropTypes.arrayOf(PropTypes.object),
    combos: PropTypes.arrayOf(PropTypes.object),
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
};
