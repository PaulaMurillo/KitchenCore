import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProcesoService from "../../services/ProcesoService";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

export function DetalleProceso() {
  const { id } = useParams();

  const [proceso, setProceso] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ProcesoService.getProcesoById(id)
      .then((response) => {
        setProceso(response.data);
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoaded(true);
      });
  }, [id]);

  if (!loaded) {
    return <p>Cargando detalle del proceso...</p>;
  }

  if (error) {
    return <p>Error cargando proceso: {error.message}</p>;
  }

  if (!proceso) {
    return <p>No se encontró el proceso de preparación.</p>;
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button component={Link} to="/procesos" variant="outlined" sx={{ mb: 3 }}>
        Volver a procesos
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {proceso.producto}
        </Typography>

        <Typography variant="body1" color="text.secondary">
          {proceso.descripcion}
        </Typography>

        <Box sx={{ mt: 2, mb: 4 }}>
          <Chip
            label={`${proceso.cantidad_pasos} pasos de preparación`}
            color="primary"
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Estaciones del proceso
        </Typography>

        <Stepper orientation="vertical" activeStep={-1}>
          {proceso.estaciones &&
            proceso.estaciones.map((estacion) => (
              <Step key={estacion.id} active>
                <StepLabel>
                  Paso {estacion.orden_paso}: {estacion.nombre_estacion}
                </StepLabel>

                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {estacion.descripcion}
                  </Typography>
                </StepContent>
              </Step>
            ))}
        </Stepper>
      </Paper>
    </Container>
  );
}