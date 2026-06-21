import { useEffect, useState } from "react";
import MenuService from "../../services/MenuService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

/** Carga y presenta los menús según su estado de disponibilidad. */
export function ListMenus() {
  const [menus, setMenus] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    MenuService.getMenus()
      .then((response) => {
        setMenus(response.data || []);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <p>Cargando menús...</p>;
  }

  if (error) {
    return <p>Error cargando menús: {error.message}</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Menús registrados
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Listado de menús ordenados por disponibilidad más reciente.
      </Typography>

      <Grid container spacing={3}>
        {menus.map((menu) => (
          <Grid item xs={12} sm={6} md={3} key={menu.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {menu.nombre}
                </Typography>

                <Box sx={{ mt: 1, mb: 2 }}>
                  <Chip
                    label={menu.estado}
                    color={menu.estado === "Disponible" ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Typography variant="body2">
                  <strong>Desde:</strong> {menu.fecha_inicio}
                </Typography>

                <Typography variant="body2">
                  <strong>Hasta:</strong> {menu.fecha_fin}
                </Typography>

                <Typography variant="body2">
                  <strong>Horario:</strong> {menu.hora_inicio} - {menu.hora_fin}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
