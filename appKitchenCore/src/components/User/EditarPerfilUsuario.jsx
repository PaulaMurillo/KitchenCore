import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserService from "../../services/UserService";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

/** Permite editar datos propios del usuario autenticado. */
export function EditarPerfilUsuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", telefono: "" });
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    UserService.getPerfil()
      .then((response) => {
        setForm({
          name: response.data?.name ?? "",
          email: response.data?.email ?? "",
          telefono: response.data?.telefono ?? "",
        });
      })
      .catch((error) =>
        setApiError(error.response?.data?.error || error.message || "No se pudo cargar el perfil"),
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nuevosErrores.email = "El correo no es valido";
    if (form.telefono.trim() && !/^[0-9+\-\s]{7,20}$/.test(form.telefono)) {
      nuevosErrores.telefono = "Use solo numeros, espacios, + o -";
    }
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    if (!validar()) return;

    try {
      setSubmitting(true);
      await UserService.updatePerfil({
        name: form.name.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
      });
      toast.success("Perfil actualizado correctamente");
      navigate("/user/perfil");
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || "No se pudo actualizar el perfil");
      setSubmitting(false);
    }
  };

  if (!loaded) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress color="secondary" /></Box>;

  return (
    <Container sx={{ py: 4 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900, mb: 3 }}>Editar perfil</Typography>
        {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <TextField name="name" label="Nombre completo" value={form.name} onChange={handleChange} required error={Boolean(errors.name)} helperText={errors.name} fullWidth />
          <TextField name="email" label="Correo" value={form.email} onChange={handleChange} required error={Boolean(errors.email)} helperText={errors.email} fullWidth />
          <TextField name="telefono" label="Telefono" value={form.telefono} onChange={handleChange} error={Boolean(errors.telefono)} helperText={errors.telefono || "Opcional"} fullWidth />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button component={Link} to="/user/perfil" variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}>
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
