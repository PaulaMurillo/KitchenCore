import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ProductoService from "../../services/ProductoService";
import { getImageUrl } from "../../utils/getImageUrl";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
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

const crearEstadoInicial = (producto) => ({
  nombre: producto?.nombre ?? "",
  descripcion: producto?.descripcion ?? "",
  precio: producto?.precio ?? "",
  id_categoria: producto?.id_categoria ? Number(producto.id_categoria) : "",
  imagen_url: producto?.imagen_url ?? "",
  activo: producto ? Number(producto.activo) === 1 : true,
  ingredientes: (producto?.ingredientes ?? []).map((ingrediente) => ({
    id_ingrediente: Number(ingrediente.id_ingrediente),
    nombre: ingrediente.nombre,
    unidad_medida: ingrediente.unidad_medida,
    cantidad_requerida: ingrediente.cantidad_requerida,
  })),
  proceso_preparacion: (producto?.proceso_preparacion ?? []).map((paso) => ({
    id_estacion: Number(paso.id_estacion),
    nombre_estacion: paso.nombre_estacion,
    descripcion: paso.descripcion,
    orden_paso: Number(paso.orden_paso),
  })),
});

/** Formulario reutilizable para crear y editar productos con sus ingredientes. */
export function ProductoForm({ initialData = null, onSubmit, submitLabel = "Guardar" }) {
  const [form, setForm] = useState(() => crearEstadoInicial(initialData));
  const [categorias, setCategorias] = useState([]);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [estacionesDisponibles, setEstacionesDisponibles] = useState([]);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [estacionSeleccionada, setEstacionSeleccionada] = useState("");
  const [ordenSeleccionado, setOrdenSeleccionado] = useState("");
  const [catalogosCargando, setCatalogosCargando] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    Promise.all([
      ProductoService.getCategorias(),
      ProductoService.getIngredientes(),
      ProductoService.getEstaciones(),
    ])
      .then(([categoriasResponse, ingredientesResponse, estacionesResponse]) => {
        setCategorias(categoriasResponse.data || []);
        setIngredientesDisponibles(ingredientesResponse.data || []);
        setEstacionesDisponibles(estacionesResponse.data || []);
      })
      .catch((error) => {
        setApiError(
          error.response?.data?.error || error.message || "No se pudieron cargar los catálogos",
        );
      })
      .finally(() => setCatalogosCargando(false));
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const agregarIngrediente = () => {
    const id = Number(ingredienteSeleccionado);
    const ingrediente = ingredientesDisponibles.find(
      (item) => Number(item.id_ingrediente) === id,
    );

    if (!ingrediente || form.ingredientes.some((item) => item.id_ingrediente === id)) {
      return;
    }

    setForm((current) => ({
      ...current,
      ingredientes: [
        ...current.ingredientes,
        {
          id_ingrediente: id,
          nombre: ingrediente.nombre,
          unidad_medida: ingrediente.unidad_medida,
          cantidad_requerida: "",
        },
      ],
    }));
    setIngredienteSeleccionado("");
    setErrors((current) => ({ ...current, ingredientes: "" }));
  };

  const actualizarCantidad = (idIngrediente, cantidad) => {
    setForm((current) => ({
      ...current,
      ingredientes: current.ingredientes.map((ingrediente) =>
        ingrediente.id_ingrediente === idIngrediente
          ? { ...ingrediente, cantidad_requerida: cantidad }
          : ingrediente,
      ),
    }));
    setErrors((current) => ({ ...current, ingredientes: "" }));
  };

  const quitarIngrediente = (idIngrediente) => {
    setForm((current) => ({
      ...current,
      ingredientes: current.ingredientes.filter(
        (ingrediente) => ingrediente.id_ingrediente !== idIngrediente,
      ),
    }));
  };

  const agregarEstacion = () => {
    const idEstacion = Number(estacionSeleccionada);
    const ordenPaso = Number(ordenSeleccionado);
    const estacion = estacionesDisponibles.find(
      (item) => Number(item.id_estacion) === idEstacion,
    );

    if (!estacion) return;
    if (!Number.isInteger(ordenPaso) || ordenPaso <= 0) {
      setErrors((current) => ({
        ...current,
        proceso_preparacion: "Indique un orden mayor que cero",
      }));
      return;
    }
    if (form.proceso_preparacion.some((paso) => paso.id_estacion === idEstacion)) {
      setErrors((current) => ({
        ...current,
        proceso_preparacion: "La estación ya fue agregada",
      }));
      return;
    }
    if (form.proceso_preparacion.some((paso) => Number(paso.orden_paso) === ordenPaso)) {
      setErrors((current) => ({
        ...current,
        proceso_preparacion: "Ya existe una estación con ese orden",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      proceso_preparacion: [
        ...current.proceso_preparacion,
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
    setErrors((current) => ({ ...current, proceso_preparacion: "" }));
  };

  const actualizarOrdenPaso = (idEstacion, ordenPaso) => {
    setForm((current) => ({
      ...current,
      proceso_preparacion: current.proceso_preparacion.map((paso) =>
        paso.id_estacion === idEstacion ? { ...paso, orden_paso: ordenPaso } : paso,
      ),
    }));
    setErrors((current) => ({ ...current, proceso_preparacion: "" }));
  };

  const quitarEstacion = (idEstacion) => {
    setForm((current) => ({
      ...current,
      proceso_preparacion: current.proceso_preparacion.filter(
        (paso) => paso.id_estacion !== idEstacion,
      ),
    }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = "El nombre es requerido";
    if (!form.descripcion.trim()) nuevosErrores.descripcion = "La descripción es requerida";
    if (!form.precio || Number(form.precio) <= 0) {
      nuevosErrores.precio = "El precio debe ser mayor que cero";
    }
    if (!form.id_categoria) nuevosErrores.id_categoria = "Seleccione una categoría";
    if (form.ingredientes.length === 0) {
      nuevosErrores.ingredientes = "Debe agregar al menos un ingrediente";
    } else if (
      form.ingredientes.some(
        (ingrediente) =>
          !ingrediente.cantidad_requerida || Number(ingrediente.cantidad_requerida) <= 0,
      )
    ) {
      nuevosErrores.ingredientes = "Todas las cantidades deben ser mayores que cero";
    }
    if (form.proceso_preparacion.length === 0) {
      nuevosErrores.proceso_preparacion = "Debe agregar al menos una estación";
    } else {
      const ordenes = form.proceso_preparacion.map((paso) => Number(paso.orden_paso));

      if (ordenes.some((orden) => !Number.isInteger(orden) || orden <= 0)) {
        nuevosErrores.proceso_preparacion =
          "Todos los pasos deben tener un orden mayor que cero";
      } else if (new Set(ordenes).size !== ordenes.length) {
        nuevosErrores.proceso_preparacion = "No se pueden repetir los órdenes";
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
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      id_categoria: Number(form.id_categoria),
      imagen_url: form.imagen_url.trim(),
      activo: form.activo ? 1 : 0,
      ingredientes: form.ingredientes.map((ingrediente) => ({
        id_ingrediente: ingrediente.id_ingrediente,
        cantidad_requerida: Number(ingrediente.cantidad_requerida),
      })),
      proceso_preparacion: form.proceso_preparacion.map((paso) => ({
        id_estacion: paso.id_estacion,
        orden_paso: Number(paso.orden_paso),
      })),
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (error) {
      setApiError(
        error.response?.data?.error || error.response?.data?.message || error.message,
      );
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
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
        </Alert>
      )}

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        Datos del producto
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
          name="precio"
          label="Precio"
          type="number"
          value={form.precio}
          onChange={handleFieldChange}
          required
          error={Boolean(errors.precio)}
          helperText={errors.precio}
          inputProps={{ min: 0.01, step: 0.01 }}
          fullWidth
        />

        <TextField
          name="descripcion"
          label="Descripción"
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

        <FormControl required error={Boolean(errors.id_categoria)} fullWidth>
          <InputLabel id="categoria-label">Categoría</InputLabel>
          <Select
            labelId="categoria-label"
            name="id_categoria"
            label="Categoría"
            value={form.id_categoria}
            onChange={handleFieldChange}
          >
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id} value={Number(categoria.id)}>
                {categoria.nombre}
              </MenuItem>
            ))}
          </Select>
          {errors.id_categoria && (
            <Typography variant="caption" color="error" sx={{ ml: 1.75, mt: 0.5 }}>
              {errors.id_categoria}
            </Typography>
          )}
        </FormControl>

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
          label={form.activo ? "Producto activo" : "Producto inactivo"}
        />

        <TextField
          name="imagen_url"
          label="Ruta o URL de imagen"
          value={form.imagen_url}
          onChange={handleFieldChange}
          placeholder="uploads/CoreBurger.jpeg"
          helperText="Ejemplo: uploads/CoreBurger.jpeg"
          fullWidth
          sx={{ gridColumn: { md: "1 / -1" } }}
        />
      </Box>

      {form.imagen_url && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Vista previa
          </Typography>
          <Box
            component="img"
            src={getImageUrl(form.imagen_url)}
            alt="Vista previa del producto"
            sx={{ width: 180, height: 120, objectFit: "cover", borderRadius: 2 }}
          />
        </Box>
      )}

      <Box sx={{ mt: 4, pt: 3, borderTop: "3px solid #E50914" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Ingredientes
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 280, flexGrow: 1 }}>
            <InputLabel id="ingrediente-label">Agregar ingrediente</InputLabel>
            <Select
              labelId="ingrediente-label"
              label="Agregar ingrediente"
              value={ingredienteSeleccionado}
              onChange={(event) => setIngredienteSeleccionado(event.target.value)}
            >
              {ingredientesDisponibles
                .filter(
                  (opcion) =>
                    !form.ingredientes.some(
                      (seleccionado) =>
                        seleccionado.id_ingrediente === Number(opcion.id_ingrediente),
                    ),
                )
                .map((ingrediente) => (
                  <MenuItem
                    key={ingrediente.id_ingrediente}
                    value={ingrediente.id_ingrediente}
                  >
                    {ingrediente.nombre} ({ingrediente.unidad_medida})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button
            type="button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={agregarIngrediente}
            disabled={!ingredienteSeleccionado}
            sx={{ backgroundColor: "#0B0B0B", "&:hover": { backgroundColor: "#E50914" } }}
          >
            Agregar
          </Button>
        </Box>

        {form.ingredientes.map((ingrediente) => (
          <Box
            key={ingrediente.id_ingrediente}
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
            <Typography sx={{ fontWeight: 700 }}>{ingrediente.nombre}</Typography>
            <TextField
              label="Cantidad requerida"
              type="number"
              size="small"
              value={ingrediente.cantidad_requerida}
              onChange={(event) =>
                actualizarCantidad(ingrediente.id_ingrediente, event.target.value)
              }
              inputProps={{ min: 0.01, step: 0.01 }}
              sx={{ gridColumn: { xs: "1 / 2", md: "auto" } }}
            />
            <Typography color="text.secondary">{ingrediente.unidad_medida}</Typography>
            <Tooltip title="Quitar ingrediente">
              <IconButton
                type="button"
                color="error"
                onClick={() => quitarIngrediente(ingrediente.id_ingrediente)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}

        {errors.ingredientes && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.ingredientes}
          </Alert>
        )}
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: "3px solid #E50914" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Proceso de preparación
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Seleccione las estaciones necesarias y defina el orden de cada paso.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto" },
            gap: 2,
            alignItems: "center",
            mb: 3,
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="estacion-label">Estación de cocina</InputLabel>
            <Select
              labelId="estacion-label"
              label="Estación de cocina"
              value={estacionSeleccionada}
              onChange={(event) => setEstacionSeleccionada(event.target.value)}
            >
              {estacionesDisponibles
                .filter(
                  (estacion) =>
                    !form.proceso_preparacion.some(
                      (paso) => paso.id_estacion === Number(estacion.id_estacion),
                    ),
                )
                .map((estacion) => (
                  <MenuItem key={estacion.id_estacion} value={estacion.id_estacion}>
                    {estacion.nombre_estacion}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            label="Orden del paso"
            type="number"
            value={ordenSeleccionado}
            onChange={(event) => setOrdenSeleccionado(event.target.value)}
            inputProps={{ min: 1, step: 1 }}
          />

          <Button
            type="button"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={agregarEstacion}
            disabled={!estacionSeleccionada || !ordenSeleccionado}
            sx={{ backgroundColor: "#0B0B0B", "&:hover": { backgroundColor: "#E50914" } }}
          >
            Agregar
          </Button>
        </Box>

        {[...form.proceso_preparacion]
          .sort((pasoA, pasoB) => Number(pasoA.orden_paso) - Number(pasoB.orden_paso))
          .map((paso) => (
            <Box
              key={paso.id_estacion}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", md: "110px 1fr 2fr auto" },
                gap: 2,
                alignItems: "center",
                p: 2,
                mb: 1.5,
                borderRadius: 2,
                backgroundColor: "rgba(0,0,0,0.04)",
              }}
            >
              <TextField
                label="Paso"
                type="number"
                size="small"
                value={paso.orden_paso}
                onChange={(event) => actualizarOrdenPaso(paso.id_estacion, event.target.value)}
                inputProps={{ min: 1, step: 1 }}
              />
              <Typography sx={{ fontWeight: 800 }}>{paso.nombre_estacion}</Typography>
              <Typography variant="body2" color="text.secondary">
                {paso.descripcion}
              </Typography>
              <Tooltip title="Quitar estación">
                <IconButton
                  type="button"
                  color="error"
                  onClick={() => quitarEstacion(paso.id_estacion)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

        {errors.proceso_preparacion && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.proceso_preparacion}
          </Alert>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
        <Button component={Link} to="/productos/mantenimiento" variant="outlined">
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

ProductoForm.propTypes = {
  initialData: PropTypes.shape({
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    precio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id_categoria: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    imagen_url: PropTypes.string,
    activo: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    ingredientes: PropTypes.arrayOf(PropTypes.object),
    proceso_preparacion: PropTypes.arrayOf(PropTypes.object),
  }),
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
};
