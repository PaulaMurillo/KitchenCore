import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";

class ProductoService {
  /** Solicita el listado de productos activos. */
  getProductos() {
    return axios.get(BASE_URL);
  }

  /** Solicita el detalle de un producto por su ID. */
  getProductoById(id) {
    return axios.get(BASE_URL + "/" + id);
  }
}

export default new ProductoService();
