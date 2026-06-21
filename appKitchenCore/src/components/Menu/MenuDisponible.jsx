import { useEffect, useState } from "react";
import MenuService from "../../services/MenuService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const formatearFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(anio, mes - 1, dia));
};

export function MenuDisponible() {
  const [menu, setMenu] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    MenuService.getMenuDisponible()
      .then((response) => {
        setMenu(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <p>Cargando menú disponible...</p>;
  }

  if (error) {
    return <p>Error cargando menú disponible: {error.message}</p>;
  }

  if (!menu) {
    return <p>No hay un menú disponible para la fecha y hora actual.</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: "#fffaf0",
        }}
      >
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            KitchenCore
          </Typography>

          <Typography variant="h5" color="text.secondary">
            {menu.nombre}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Chip
              label={`Disponible del ${formatearFecha(
                menu.fecha_inicio,
              )} al ${formatearFecha(menu.fecha_fin)}`}
              color="primary"
              sx={{ mr: 1, mb: 1 }}
            />

            <Chip
              label={`Horario: ${menu.hora_inicio} - ${menu.hora_fin}`}
              color="secondary"
              sx={{ mb: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {menu.categorias &&
          menu.categorias.map((categoria) => (
            <Box key={categoria.categoria} sx={{ mb: 5 }}>
              <Typography variant="h4" component="h2" gutterBottom>
                {categoria.categoria}
              </Typography>

              <Grid container spacing={2}>
                {categoria.items.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="h6">{item.nombre}</Typography>

                            <Typography variant="body2" color="text.secondary">
                              {item.descripcion}
                            </Typography>
                          </Box>

                          <Typography variant="h6" color="secondary">
                            ₡{Number(item.precio).toLocaleString("es-CR")}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
      </Paper>
    </Container>
  );
}
