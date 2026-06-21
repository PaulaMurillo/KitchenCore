// eslint-disable-next-line no-unused-vars
import React from "react";
import { Box, Container, Typography } from "@mui/material";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "#0B0B0B",
        color: "#FFFFFF",
        borderTop: "4px solid #E50914",
        py: 2.5,
        mt: "auto",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          align="center"
          variant="subtitle1"
          sx={{
            color: "#FFFFFF",
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          ISW-613
        </Typography>

        <Typography
          align="center"
          variant="body2"
          sx={{
            color: "#E50914",
            fontWeight: 700,
            mt: 0.5,
          }}
        >
          {new Date().getFullYear()} · KitchenCore
        </Typography>
      </Container>
    </Box>
  );
}