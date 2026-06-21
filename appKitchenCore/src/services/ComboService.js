import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "combo";

class ComboService {
  getCombos() {
    return axios.get(BASE_URL);
  }

  getComboById(id) {
    return axios.get(BASE_URL + "/" + id);
  }
}

export default new ComboService();