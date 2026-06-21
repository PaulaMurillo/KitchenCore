import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ComboService from "../../services/ComboService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

export function ListCombos() {
  const [combos, setCombos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ComboService.getCombos()
      .then((response) => {
        setCombos(response.data || []);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <p>Cargando combos...</p>;
  }

  if (error) {
    return <p>Error cargando combos: {error.message}</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Combos
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Listado de combos disponibles de KitchenCore.
      </Typography>

      <Grid container spacing={3}>
        {combos.map((combo) => (
          <Grid item xs={12} sm={6} md={3} key={combo.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2">
                  {combo.nombre}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {combo.descripcion}
                </Typography>

                <Box sx={{ mt: 2, mb: 1 }}>
                  <Chip
                    label={`${combo.cantidad_productos} productos`}
                    size="small"
                    color="primary"
                  />
                </Box>

                <Typography variant="h6" color="secondary">
                  ₡{Number(combo.precio_especial).toLocaleString("es-CR")}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  component={Link}
                  to={`/combos/${combo.id}`}
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