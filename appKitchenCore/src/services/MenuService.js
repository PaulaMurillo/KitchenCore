import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "menu";

class MenuService {
  getMenus() {
    return axios.get(BASE_URL);
  }

  getMenuDisponible() {
    return axios.get(BASE_URL + "/disponible");
  }
}

export default new MenuService();