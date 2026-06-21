import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ComboService from "../../services/ComboService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

export function DetalleCombo() {
  const { id } = useParams();

  const [combo, setCombo] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ComboService.getComboById(id)
      .then((response) => {
        setCombo(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [id]);

  if (!loaded) {
    return <p>Cargando detalle del combo...</p>;
  }

  if (error) {
    return <p>Error cargando combo: {error.message}</p>;
  }

  if (!combo) {
    return <p>No se encontró el combo.</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button component={Link} to="/combos" variant="outlined" sx={{ mb: 3 }}>
        Volver a combos
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {combo.nombre}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {combo.descripcion}
        </Typography>

        <Typography variant="h5" color="secondary" sx={{ mt: 2 }}>
          ₡{Number(combo.precio_especial).toLocaleString("es-CR")}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Chip
            label={`${combo.productos ? combo.productos.length : 0} productos incluidos`}
            color="primary"
          />
        </Box>

        <Typography variant="h6" sx={{ mt: 4 }}>
          Productos incluidos
        </Typography>

        <List>
          {combo.productos &&
            combo.productos.map((producto) => (
              <ListItem key={producto.id} divider>
                <ListItemText
                  primary={`${producto.cantidad} x ${producto.nombre}`}
                  secondary={`Precio individual: ₡${Number(producto.precio).toLocaleString(
                    "es-CR"
                  )}`}
                />
              </ListItem>
            ))}
        </List>
      </Paper>
    </Container>
  );
}