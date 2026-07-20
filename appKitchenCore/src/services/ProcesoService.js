import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "preparacion";

class ProcesoService {
  /** Solicita el listado de procesos de preparacion. */
  getProcesos() {
    return axios.get(BASE_URL);
  }

  /** Solicita todos los procesos para mantenimiento. */
  getProcesosMantenimiento() {
    return axios.get(BASE_URL + "/mantenimiento");
  }

  /** Solicita el detalle de un proceso por el ID del producto. */
  getProcesoById(id) {
    return axios.get(BASE_URL + "/" + id);
  }

  /** Solicita productos activos. */
  getProductos() {
    return axios.get(BASE_URL + "/productos");
  }

  /** Solicita estaciones de cocina. */
  getEstaciones() {
    return axios.get(BASE_URL + "/estaciones");
  }

  /** Registra un proceso. */
  createProceso(data) {
    return axios.post(BASE_URL + "/create", data);
  }

  /** Actualiza un proceso. */
  updateProceso(id, data) {
    return axios.post(BASE_URL + "/update/" + id, data);
  }
}

export default new ProcesoService();
