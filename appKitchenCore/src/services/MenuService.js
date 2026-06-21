import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "menu";

class MenuService {
  /** Solicita el listado completo de menús. */
  getMenus() {
    return axios.get(BASE_URL);
  }

  /** Solicita el menú disponible para el momento actual. */
  getMenuDisponible() {
    return axios.get(BASE_URL + "/disponible");
  }
}

export default new MenuService();
