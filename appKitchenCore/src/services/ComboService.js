import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "combo";

class ComboService {
  /** Solicita el listado de combos activos. */
  getCombos() {
    return axios.get(BASE_URL);
  }

  /** Solicita todos los combos para mantenimiento. */
  getCombosMantenimiento() {
    return axios.get(BASE_URL + "/mantenimiento");
  }

  /** Solicita el detalle de un combo por su ID. */
  getComboById(id) {
    return axios.get(BASE_URL + "/" + id);
  }

  /** Solicita productos activos para armar combos. */
  getProductos() {
    return axios.get(BASE_URL + "/productos");
  }

  /** Registra un combo. */
  createCombo(data) {
    return axios.post(BASE_URL + "/create", data);
  }

  /** Actualiza un combo. */
  updateCombo(id, data) {
    return axios.post(BASE_URL + "/update/" + id, data);
  }

  /** Desactiva un combo. */
  deleteCombo(id) {
    return axios.post(BASE_URL + "/delete/" + id);
  }

  /** Reactiva un combo. */
  activarCombo(id) {
    return axios.post(BASE_URL + "/activar/" + id);
  }
}

export default new ComboService();
