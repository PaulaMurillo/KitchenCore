import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductoService from "../../services/ProductoService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

/** Carga y presenta el catálogo de productos activos. */
export function ListProductos() {
  const [productos, setProductos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  /** Construye la URL pública de la imagen de un producto. */
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
    ProductoService.getProductos()
      .then((response) => {
        setProductos(response.data || []);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>Error cargando productos: {error.message}</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Productos
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Listado de productos disponibles de KitchenCore.
      </Typography>

      <Grid container spacing={3}>
        {productos.map((producto) => (
          <Grid item xs={12} sm={6} md={3} key={producto.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardMedia
                component="img"
                height="180"
                image={getImageUrl(producto.imagen_url)}
                alt={producto.nombre}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2">
                  {producto.nombre}
                </Typography>

                <Box sx={{ mt: 1, mb: 1 }}>
                  <Chip label={producto.categoria} size="small" color="primary" />
                </Box>

                <Typography variant="h6" color="secondary">
                  ₡{Number(producto.precio).toLocaleString("es-CR")}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  component={Link}
                  to={`/productos/${producto.id}`}
                  size="small"
                  variant="contained"
                  fullWidth
                >
                  Ver detalle
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
