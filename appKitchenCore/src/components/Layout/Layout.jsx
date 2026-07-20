// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";
import { Box, Container } from "@mui/material";
import Header from "./Header";
import { Footer } from "./Footer";

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

/** Distribuye encabezado, contenido principal y pie de página. */
export function Layout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top left, rgba(229, 9, 20, 0.10), transparent 28%), linear-gradient(180deg, #ffffff 0%, #f5f5f5 55%, #ffffff 100%)",
      }}
    >
      <Header />

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flex: 1,
          pt: { xs: 3, md: 4 },
          pb: { xs: 5, md: 6 },
        }}
      >
        {children}
      </Container>

      <Footer />
    </Box>
  );
}
