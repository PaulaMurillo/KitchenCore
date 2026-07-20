import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import UserService from "../../services/UserService";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const crearEstadoInicial = (usuario) => ({
  name: usuario?.name ?? "",
  email: usuario?.email ?? "",
  telefono: usuario?.telefono ?? "",
  rol_id: usuario?.rol_id ? Number(usuario.rol_id) : "",
  activo: usuario ? Number(usuario.activo) === 1 : true,
  password: "",
  confirmPassword: "",
});

/** Formulario reutilizable para crear y editar usuarios. */
export function UsuarioForm({ initialData = null, onSubmit, submitLabel = "Guardar" }) {
  const [form, setForm] = useState(() => crearEstadoInicial(initialData));
  const [roles, setRoles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const esEdicion = Boolean(initialData);

  useEffect(() => {
    UserService.getRoles()
      .then((response) => setRoles(response.data || []))
      .catch((error) =>
        setApiError(error.response?.data?.error || error.message || "No se pudieron cargar los roles"),
      )
      .finally(() => setLoaded(true));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.name.trim()) nuevosErrores.name = "El nombre es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = "El correo no es valido";
    }
    if (form.telefono.trim() && !/^[0-9+\-\s]{7,20}$/.test(form.telefono)) {
      nuevosErrores.telefono = "Use solo numeros, espacios, + o -";
    }
    if (!form.rol_id) nuevosErrores.rol_id = "Seleccione un rol";
    if (!esEdicion) {
      if (form.password.length < 6) {
        nuevosErrores.password = "La contrasena debe tener al menos 6 caracteres";
      }
      if (form.password !== form.confirmPassword) {
        nuevosErrores.confirmPassword = "La confirmacion no coincide";
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
      name: form.name.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      rol_id: Number(form.rol_id),
      activo: form.activo ? 1 : 0,
    };

    if (!esEdicion) {
      payload.password = form.password;
      payload.confirmPassword = form.confirmPassword;
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || "No se pudo guardar el usuario");
      setSubmitting(false);
    }
  };

  if (!loaded) {
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
        Datos del usuario
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        <TextField name="name" label="Nombre completo" value={form.name} onChange={handleChange} required error={Boolean(errors.name)} helperText={errors.name} fullWidth />
        <TextField name="email" label="Correo" value={form.email} onChange={handleChange} required error={Boolean(errors.email)} helperText={errors.email} fullWidth />
        <TextField name="telefono" label="Telefono" value={form.telefono} onChange={handleChange} error={Boolean(errors.telefono)} helperText={errors.telefono || "Opcional"} fullWidth />
        <FormControl required error={Boolean(errors.rol_id)} fullWidth>
          <InputLabel id="rol-usuario-label">Rol</InputLabel>
          <Select labelId="rol-usuario-label" name="rol_id" label="Rol" value={form.rol_id} onChange={handleChange}>
            {roles.map((rol) => (
              <MenuItem key={rol.id} value={Number(rol.id)}>{rol.name}</MenuItem>
            ))}
          </Select>
          {errors.rol_id && <Typography variant="caption" color="error" sx={{ ml: 1.75, mt: 0.5 }}>{errors.rol_id}</Typography>}
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={form.activo}
              onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
              color="success"
            />
          }
          label={form.activo ? "Usuario activo" : "Usuario inactivo"}
        />
      </Box>

      {!esEdicion && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mt: 3 }}>
          <TextField name="password" label="Contrasena" type="password" value={form.password} onChange={handleChange} required error={Boolean(errors.password)} helperText={errors.password} fullWidth />
          <TextField name="confirmPassword" label="Confirmar contrasena" type="password" value={form.confirmPassword} onChange={handleChange} required error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword} fullWidth />
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Button component={Link} to="/usuarios/mantenimiento" variant="outlined">Cancelar</Button>
        <Button type="submit" variant="contained" disabled={submitting} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </Box>
    </Paper>
  );
}

UsuarioForm.propTypes = {
  initialData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    telefono: PropTypes.string,
    rol_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    activo: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
};
