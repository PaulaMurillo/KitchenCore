import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { MenuDisponible } from "../Menu/MenuDisponible";

/** Presenta la página de inicio y el acceso a las funciones principales. */
export function Home() {
  return (
    <Container sx={{ py: 4 }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 4,
          backgroundColor: "#0B0B0B",
          color: "#FFFFFF",
          borderBottom: "5px solid #E50914",
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, mb: 2 }}>
              Kitchen<span style={{ color: "#E50914" }}>Core</span>
            </Typography>

            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.82)" }}>
              Sistema integral para negocios de comida rápida. Gestiona productos,
              combos, menús disponibles y procesos de preparación de forma
              organizada, rápida y eficiente.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button component={Link} to="/productos" variant="contained" color="secondary">
                Ver productos
              </Button>

              <Button
                component={Link}
                to="/menu-disponible"
                variant="outlined"
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#FFFFFF",
                  "&:hover": {
                    borderColor: "#E50914",
                    backgroundColor: "rgba(229,9,20,0.12)",
                  },
                }}
              >
                Menú disponible
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <MenuDisponible />
    </Container>
  );
}
