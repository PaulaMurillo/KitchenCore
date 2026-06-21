import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProcesoService from "../../services/ProcesoService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

/** Carga y presenta los procesos de preparación de los productos. */
export function ListProcesos() {
  const [procesos, setProcesos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ProcesoService.getProcesos()
      .then((response) => {
        setProcesos(response.data || []);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <p>Cargando procesos de preparación...</p>;
  }

  if (error) {
    return <p>Error cargando procesos: {error.message}</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Procesos de preparación
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Listado de productos con la cantidad total de estaciones de preparación.
      </Typography>

      <Grid container spacing={3}>
        {procesos.map((proceso) => (
          <Grid item xs={12} sm={6} md={3} key={proceso.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2">
                  {proceso.producto}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${proceso.cantidad_pasos} pasos`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  component={Link}
                  to={`/procesos/${proceso.id}`}
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
