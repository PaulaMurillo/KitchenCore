import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "combo";

class ComboService {
  /** Solicita el listado de combos activos. */
  getCombos() {
    return axios.get(BASE_URL);
  }

  /** Solicita el detalle de un combo por su ID. */
  getComboById(id) {
    return axios.get(BASE_URL + "/" + id);
  }
}

export default new ComboService();
