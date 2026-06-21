import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";

class ProductoService {
  getProductos() {
    return axios.get(BASE_URL);
  }

  getProductoById(id) {
    return axios.get(BASE_URL + "/" + id);
  }
}

export default new ProductoService();