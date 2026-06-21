import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "preparacion";

class ProcesoService {
  getProcesos() {
    return axios.get(BASE_URL);
  }

  getProcesoById(id) {
    return axios.get(BASE_URL + "/" + id);
  }
}

export default new ProcesoService();
