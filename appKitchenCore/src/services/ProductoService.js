import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "producto";

class ProductoService {
  /** Solicita el listado de productos activos. */
  getProductos() {
    return axios.get(BASE_URL);
  }

  /** Solicita todos los productos para la pantalla de mantenimiento. */
  getProductosMantenimiento() {
    return axios.get(BASE_URL + "/mantenimiento");
  }

  /** Solicita el detalle de un producto por su ID. */
  getProductoById(id) {
    return axios.get(BASE_URL + "/" + id);
  }

  /** Solicita las categorías disponibles para productos. */
  getCategorias() {
    return axios.get(BASE_URL + "/categorias");
  }

  /** Solicita los ingredientes activos disponibles. */
  getIngredientes() {
    return axios.get(BASE_URL + "/ingredientes");
  }

  /** Solicita las estaciones disponibles para procesos de preparación. */
  getEstaciones() {
    return axios.get(BASE_URL + "/estaciones");
  }

  /** Registra un producto con sus ingredientes. */
  createProducto(data) {
    return axios.post(BASE_URL, data);
  }

  /** Actualiza los datos y los ingredientes de un producto. */
  updateProducto(id, data) {
    return axios.put(BASE_URL + "/" + id, data);
  }

  /** Desactiva un producto sin eliminarlo físicamente. */
  deleteProducto(id) {
    return axios.delete(BASE_URL + "/" + id);
  }

  /** Reactiva un producto desactivado. */
  activarProducto(id) {
    return axios.post(BASE_URL + "/activar/" + id);
  }
}

export default new ProductoService();
