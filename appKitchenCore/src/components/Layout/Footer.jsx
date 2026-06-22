import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";

const redesSociales = [
  { nombre: "Instagram", url: "https://www.instagram.com/", icono: <InstagramIcon /> },
  { nombre: "Facebook", url: "https://www.facebook.com/", icono: <FacebookIcon /> },
  { nombre: "WhatsApp", url: "https://www.whatsapp.com/", icono: <WhatsAppIcon /> },
];

const preguntasFrecuentes = [
  {
    pregunta: "¿Dónde puedo consultar el menú disponible?",
    respuesta: "En la opción Menú disponible encontrará la oferta vigente según la fecha y hora.",
  },
  {
    pregunta: "¿Cómo reviso los ingredientes de un producto?",
    respuesta: "Abra Productos y seleccione Ver detalle en el producto que desea consultar.",
  },
  {
    pregunta: "¿Los precios se muestran en colones?",
    respuesta: "Sí. KitchenCore presenta los precios utilizando el formato de Costa Rica.",
  },
];

/** Presenta información comercial, redes, valoración y preguntas frecuentes. */
export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: "auto",
        backgroundColor: "#0B0B0B",
        color: "#FFFFFF",
        borderTop: "5px solid #E50914",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.24)",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 6 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "1.1fr 1fr 1fr 1.6fr",
            },
            gap: { xs: 4, md: 5 },
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
              Kitchen<span style={{ color: "#E50914" }}>Core</span>
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8 }}>
              Sabores, menús y procesos organizados para ofrecer una experiencia rápida y
              confiable.
            </Typography>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 800 }}>
              Síguenos
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {redesSociales.map((red) => (
                <IconButton
                  key={red.nombre}
                  component="a"
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.nombre}
                  title={red.nombre}
                  sx={{
                    color: "#FFFFFF",
                    border: "1px solid rgba(255,255,255,0.25)",
                    "&:hover": { backgroundColor: "#E50914", borderColor: "#E50914" },
                  }}
                >
                  {red.icono}
                </IconButton>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Ubicación
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 2 }}>
              <LocationOnIcon sx={{ color: "#E50914" }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  San José, Costa Rica
                </Typography>
                <Link
                  href="https://maps.google.com/?q=San+Jose+Costa+Rica"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.85rem" }}
                >
                  Ver ubicación sugerida
                </Link>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <AccessTimeIcon sx={{ color: "#E50914" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
                Consulte el horario del menú disponible
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Tu opinión importa
            </Typography>
            <Rating
              name="valoracion-kitchencore"
              value={5}
              readOnly
              sx={{ color: "#FFD700", mb: 1.5 }}
            />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8 }}>
              Ayúdanos a seguir mejorando. Comparte tu experiencia y tus sugerencias con el
              equipo de KitchenCore.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
              Preguntas frecuentes
            </Typography>
            {preguntasFrecuentes.map((item) => (
              <Accordion
                key={item.pregunta}
                disableGutters
                elevation={0}
                sx={{
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#E50914" }} />}
                  sx={{ px: 1.5 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.pregunta}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1.5, pt: 0 }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                    {item.respuesta}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", py: 2 }}>
        <Container maxWidth="xl">
          <Typography
            align="center"
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.62)" }}
          >
            © {new Date().getFullYear()} KitchenCore · Todos los derechos reservados
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
