import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ComboService from "../../services/ComboService";
import UploadService from "../../services/UploadService";
import { getImageUrl } from "../../utils/getImageUrl";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

const crearEstadoInicial = (combo) => ({
  nombre: combo?.nombre ?? "",
  descripcion: combo?.descripcion ?? "",
  precio_especial: combo?.precio_especial ?? "",
  imagen_url: combo?.imagen_url ?? "",
  activo: combo ? Number(combo.activo) === 1 : true,
  productos: (combo?.productos ?? []).map((producto) => ({
    id_producto: Number(producto.id),
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: producto.cantidad,
  })),
});

/** Formulario reutilizable para crear y editar combos. */
export function ComboForm({ initialData = null, onSubmit, submitLabel = "Guardar" }) {
  const [form, setForm] = useState(() => crearEstadoInicial(initialData));
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [catalogoCargando, setCatalogoCargando] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const comboFallback = "/uploads/default-combo.jpg";

  useEffect(() => {
    ComboService.getProductos()
      .then((response) => setProductosDisponibles(response.data || []))
      .catch((error) =>
        setApiError(error.response?.data?.error || error.message || "No se pudieron cargar los productos"),
      )
      .finally(() => setCatalogoCargando(false));
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setApiError("");
    setUploadingImage(true);

    try {
      const response = await UploadService.uploadImage(file, "combo");
      const imagenUrl = response.data?.imagen_url;

      if (!imagenUrl) {
        throw new Error("El servidor no devolvio la ruta de la imagen");
      }

      setForm((current) => ({ ...current, imagen_url: imagenUrl }));
      setErrors((current) => ({ ...current, imagen_url: "" }));
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || "No se pudo cargar la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const agregarProducto = () => {
    const id = Number(productoSeleccionado);
    const producto = productosDisponibles.find((item) => Number(item.id) === id);

    if (!producto || form.productos.some((item) => item.id_producto === id)) return;

    setForm((current) => ({
      ...current,
      productos: [
        ...current.productos,
        { id_producto: id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 },
      ],
    }));
    setProductoSeleccionado("");
    setErrors((current) => ({ ...current, productos: "" }));
  };

  const actualizarCantidad = (idProducto, cantidad) => {
    setForm((current) => ({
      ...current,
      productos: current.productos.map((producto) =>
        producto.id_producto === idProducto ? { ...producto, cantidad } : producto,
      ),
    }));
    setErrors((current) => ({ ...current, productos: "" }));
  };

  const quitarProducto = (idProducto) => {
    setForm((current) => ({
      ...current,
      productos: current.productos.filter((producto) => producto.id_producto !== idProducto),
    }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es requerido";
    if (form.nombre.trim().length > 0 && form.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }
    if (!form.descripcion.trim()) nuevosErrores.descripcion = "La descripcion es requerida";
    if (!form.precio_especial || Number(form.precio_especial) <= 0) {
      nuevosErrores.precio_especial = "El precio debe ser mayor que cero";
    }
    if (
      form.imagen_url.trim() &&
      (form.imagen_url.includes("\\") ||
        form.imagen_url.includes("..") ||
        /^[a-zA-Z]:/.test(form.imagen_url))
    ) {
      nuevosErrores.imagen_url = "Use una ruta relativa como uploads/combo.jpg";
    }
    if (form.productos.length === 0) {
      nuevosErrores.productos = "Debe agregar al menos un producto";
    } else if (
      form.productos.some((producto) => !producto.cantidad || Number(producto.cantidad) <= 0)
    ) {
      nuevosErrores.productos = "Todas las cantidades deben ser mayores que cero";
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
      descripcion: form.descripcion.trim(),
      precio_especial: Number(form.precio_especial),
      imagen_url: form.imagen_url.trim(),
      activo: form.activo ? 1 : 0,
      productos: form.productos.map((producto) => ({
        id_producto: producto.id_producto,
        cantidad: Number(producto.cantidad),
      })),
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || "No se pudo guardar el combo");
      setSubmitting(false);
    }
  };

  if (catalogoCargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, md: 4 } }}>
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Datos del combo
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        <TextField
          name="nombre"
          label="Nombre"
          value={form.nombre}
          onChange={handleFieldChange}
          required
          error={Boolean(errors.nombre)}
          helperText={errors.nombre}
          fullWidth
        />
        <TextField
          name="precio_especial"
          label="Precio especial"
          type="number"
          value={form.precio_especial}
          onChange={handleFieldChange}
          required
          error={Boolean(errors.precio_especial)}
          helperText={errors.precio_especial}
          inputProps={{ min: 0.01, step: 0.01 }}
          fullWidth
        />
        <TextField
          name="descripcion"
          label="Descripcion"
          value={form.descripcion}
          onChange={handleFieldChange}
          required
          multiline
          minRows={3}
          error={Boolean(errors.descripcion)}
          helperText={errors.descripcion}
          fullWidth
          sx={{ gridColumn: { md: "1 / -1" } }}
        />
        <TextField
          name="imagen_url"
          label="Imagen URL"
          value={form.imagen_url}
          onChange={handleFieldChange}
          placeholder="uploads/combo-bacon-premium.jpg"
          error={Boolean(errors.imagen_url)}
          helperText={
            errors.imagen_url ||
            "Puede buscar una imagen local o escribir una ruta como uploads/combo-bacon-premium.jpg"
          }
          fullWidth
          sx={{ gridColumn: { md: "1 / -1" } }}
        />
        <Button
          component="label"
          type="button"
          variant="outlined"
          startIcon={uploadingImage ? <CircularProgress size={18} /> : <PhotoCameraIcon />}
          disabled={uploadingImage}
          sx={{ justifySelf: "start" }}
        >
          {uploadingImage ? "Cargando..." : "Buscar imagen"}
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
          />
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={form.activo}
              onChange={(event) =>
                setForm((current) => ({ ...current, activo: event.target.checked }))
              }
              color="success"
            />
          }
          label={form.activo ? "Combo activo" : "Combo inactivo"}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Vista previa
        </Typography>
        <Box
          component="img"
          src={getImageUrl(form.imagen_url, comboFallback)}
          alt="Vista previa del combo"
          onError={(event) => {
            event.currentTarget.src = comboFallback;
          }}
          sx={{ width: 220, height: 140, objectFit: "cover", borderRadius: 2 }}
        />
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: "3px solid #E50914" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Productos incluidos
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 280, flexGrow: 1 }}>
            <InputLabel id="producto-combo-label">Agregar producto</InputLabel>
            <Select
              labelId="producto-combo-label"
              label="Agregar producto"
              value={productoSeleccionado}
              onChange={(event) => setProductoSeleccionado(event.target.value)}
            >
              {productosDisponibles
                .filter(
                  (opcion) =>
                    !form.productos.some((producto) => producto.id_producto === Number(opcion.id)),
                )
                .map((producto) => (
                  <MenuItem key={producto.id} value={producto.id}>
                    {producto.nombre} - ₡{Number(producto.precio).toLocaleString("es-CR")}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button
            type="button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={agregarProducto}
            disabled={!productoSeleccionado}
            sx={{ backgroundColor: "#0B0B0B", "&:hover": { backgroundColor: "#E50914" } }}
          >
            Agregar
          </Button>
        </Box>

        {form.productos.map((producto) => (
          <Box
            key={producto.id_producto}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "2fr 1fr 1fr auto" },
              gap: 2,
              alignItems: "center",
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(0,0,0,0.04)",
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>{producto.nombre}</Typography>
            <TextField
              label="Cantidad"
              type="number"
              size="small"
              value={producto.cantidad}
              onChange={(event) => actualizarCantidad(producto.id_producto, event.target.value)}
              inputProps={{ min: 1, step: 1 }}
            />
            <Typography color="text.secondary">
              ₡{Number(producto.precio).toLocaleString("es-CR")}
            </Typography>
            <Tooltip title="Quitar producto">
              <IconButton
                type="button"
                color="error"
                onClick={() => quitarProducto(producto.id_producto)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {errors.productos && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.productos}
          </Alert>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Button component={Link} to="/combos/mantenimiento" variant="outlined">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ backgroundColor: "#E50914", "&:hover": { backgroundColor: "#B20710" } }}
        >
          {submitting ? "Guardando..." : submitLabel}
        </Button>
      </Box>
    </Paper>
  );
}

ComboForm.propTypes = {
  initialData: PropTypes.shape({
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    precio_especial: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imagen_url: PropTypes.string,
    activo: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    productos: PropTypes.arrayOf(PropTypes.object),
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
};
