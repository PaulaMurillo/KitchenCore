import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "preparacion";

class ProcesoService {
  /** Solicita el listado de procesos de preparación. */
  getProcesos() {
    return axios.get(BASE_URL);
  }

  /** Solicita el detalle de un proceso por el ID del producto. */
  getProcesoById(id) {
    return axios.get(BASE_URL + "/" + id);
  }
}

export default new ProcesoService();
