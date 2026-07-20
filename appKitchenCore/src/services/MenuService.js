import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "menu";

class MenuService {
  /** Solicita el listado completo de menús. */
  getMenus() {
    return axios.get(BASE_URL);
  }

  /** Solicita todos los menús para mantenimiento. */
  getMenusMantenimiento() {
    return axios.get(BASE_URL + "/mantenimiento");
  }

  /** Solicita un menu por ID. */
  getMenuById(id) {
    return axios.get(BASE_URL + "/" + id);
  }

  /** Solicita el menú disponible para el momento actual. */
  getMenuDisponible() {
    return axios.get(BASE_URL + "/disponible");
  }

  /** Solicita productos activos para menús. */
  getProductos() {
    return axios.get(BASE_URL + "/productos");
  }

  /** Solicita combos activos para menús. */
  getCombos() {
    return axios.get(BASE_URL + "/combos");
  }

  /** Registra un menu. */
  createMenu(data) {
    return axios.post(BASE_URL + "/create", data);
  }

  /** Actualiza un menu. */
  updateMenu(id, data) {
    return axios.post(BASE_URL + "/update/" + id, data);
  }

  /** Desactiva un menu. */
  deleteMenu(id) {
    return axios.post(BASE_URL + "/delete/" + id);
  }

  /** Reactiva un menu. */
  activarMenu(id) {
    return axios.post(BASE_URL + "/activar/" + id);
  }
}

export default new MenuService();
