import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MenuService from "../../services/MenuService";
import { formatearPrecio, formatearRangoFechas, formatearRangoHoras } from "../../utils/formatters";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

/** Carga y muestra el detalle de un menú. */
export function DetalleMenu() {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    MenuService.getMenuById(id)
      .then((response) => setMenu(response.data))
      .catch((error) =>
        setError(error.response?.data?.error || error.message || "No se pudo cargar el menú"),
      )
      .finally(() => setLoaded(true));
  }, [id]);

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error || !menu) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Menú no encontrado"}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button component={Link} to="/menus/mantenimiento" variant="outlined" sx={{ mb: 3 }}>
        Volver a menús
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>{menu.nombre}</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          <Chip label={Number(menu.activo) === 1 ? "Activo" : "Inactivo"} color={Number(menu.activo) === 1 ? "success" : "default"} />
          <Chip label={formatearRangoFechas(menu.fecha_inicio, menu.fecha_fin)} />
          <Chip label={formatearRangoHoras(menu.hora_inicio, menu.hora_fin)} />
        </Box>

        <Typography variant="h6">Productos incluidos</Typography>
        <List>
          {(menu.productos || []).map((producto) => (
            <ListItem key={producto.id} divider>
              <ListItemText
                primary={producto.nombre}
                secondary={`${producto.categoria} - ${formatearPrecio(producto.precio)}`}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="h6" sx={{ mt: 3 }}>Combos incluidos</Typography>
        <List>
          {(menu.combos || []).map((combo) => (
            <ListItem key={combo.id} divider>
              <ListItemText
                primary={combo.nombre}
                secondary={formatearPrecio(combo.precio_especial)}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
