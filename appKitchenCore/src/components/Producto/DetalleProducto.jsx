import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductoService from "../../services/ProductoService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

export function DetalleProducto() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const getImageUrl = (imagen) => {
    if (!imagen) {
      return "https://placehold.co/600x400?text=KitchenCore";
    }

    if (imagen.startsWith("http")) {
      return imagen;
    }

    return "https://placehold.co/600x400?text=KitchenCore";
  };

  useEffect(() => {
    ProductoService.getProductoById(id)
      .then((response) => {
        setProducto(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [id]);

  if (!loaded) {
    return <p>Cargando detalle del producto...</p>;
  }

  if (error) {
    return <p>Error cargando producto: {error.message}</p>;
  }

  if (!producto) {
    return <p>No se encontró el producto.</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button component={Link} to="/productos" variant="outlined" sx={{ mb: 3 }}>
        Volver a productos
      </Button>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={getImageUrl(producto.imagen_url)}
              alt={producto.nombre}
              sx={{
                width: "100%",
                borderRadius: 2,
                objectFit: "cover",
              }}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="h4" component="h1" gutterBottom>
              {producto.nombre}
            </Typography>

            <Chip label={producto.categoria} color="primary" sx={{ mb: 2 }} />

            <Typography variant="h5" color="secondary" gutterBottom>
              ₡{Number(producto.precio).toLocaleString("es-CR")}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Descripción
            </Typography>

            <Typography variant="body1" color="text.secondary">
              {producto.descripcion}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Ingredientes
            </Typography>

            <List>
              {producto.ingredientes &&
                producto.ingredientes.map((ingrediente, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText
                      primary={ingrediente.nombre}
                      secondary={`${ingrediente.cantidad_requerida} ${ingrediente.unidad_medida}`}
                    />
                  </ListItem>
                ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}