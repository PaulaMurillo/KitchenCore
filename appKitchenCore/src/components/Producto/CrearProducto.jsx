import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProductoService from "../../services/ProductoService";
import { ProductoForm } from "./ProductoForm";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/** Presenta el formulario para registrar un producto. */
export function CrearProducto() {
  const navigate = useNavigate();

  const guardarProducto = async (data) => {
    await ProductoService.createProducto(data);
    toast.success("Producto creado correctamente");
    navigate("/productos/mantenimiento");
  };

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
          Crear Producto
        </Typography>
      </Box>

      <ProductoForm onSubmit={guardarProducto} submitLabel="Crear producto" />
    </Container>
  );
}
