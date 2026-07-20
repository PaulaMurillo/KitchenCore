export const formatearPrecio = (valor) => `₡${Number(valor).toLocaleString("es-CR")}`;

export const formatearFecha = (fecha) => {
  if (!fecha) return "";

  const [anio, mes, dia] = String(fecha).split("-").map(Number);

  if (!anio || !mes || !dia) return fecha;

  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(anio, mes - 1, dia));
};

export const formatearHora = (hora) => {
  if (!hora) return "";

  const [horas = "00", minutos = "00"] = String(hora).split(":");
  const fecha = new Date(2000, 0, 1, Number(horas), Number(minutos));

  return new Intl.DateTimeFormat("es-CR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(fecha);
};

export const formatearRangoFechas = (inicio, fin) =>
  `${formatearFecha(inicio)} al ${formatearFecha(fin)}`;

export const formatearRangoHoras = (inicio, fin) =>
  `${formatearHora(inicio)} - ${formatearHora(fin)}`;
