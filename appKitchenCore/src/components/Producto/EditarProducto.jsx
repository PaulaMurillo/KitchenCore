import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ProductoService from "../../services/ProductoService";
import { ProductoForm } from "./ProductoForm";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Carga y presenta el formulario de edición del producto solicitado. */
export function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ProductoService.getProductoById(id)
      .then((response) => setProducto(response.data))
      .catch((error) =>
        setError(error.response?.data?.error || error.message || "No se pudo cargar el producto"),
      )
      .finally(() => setLoaded(true));
  }, [id]);

  const guardarProducto = async (data) => {
    await ProductoService.updateProducto(id, data);
    toast.success("Producto actualizado correctamente");
    navigate("/productos/mantenimiento");
  };

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !producto) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Producto no encontrado"}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          backgroundColor: "#0B0B0B",
          color: "#FFFFFF",
          borderBottom: "5px solid #E50914",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Editar Producto
        </Typography>
      </Box>

      <ProductoForm
        initialData={producto}
        onSubmit={guardarProducto}
        submitLabel="Guardar cambios"
      />
    </Container>
  );
}
