import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "user";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "null");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

class UserService {
  /** Solicita el listado completo de usuarios. */
  getUsers() {
    return axios.get(BASE_URL);
  }

  /** Solicita los usuarios para mantenimiento. */
  getUsuariosMantenimiento() {
    return axios.get(BASE_URL + "/mantenimiento");
  }

  /** Solicita los datos de un usuario por su ID. */
  getUserById(UserId) {
    return axios.get(BASE_URL + "/" + UserId);
  }

  /** Alias usado por el mantenimiento de usuarios. */
  getUsuarioById(id) {
    return axios.get(BASE_URL + "/" + id);
  }

  /** Solicita todos los usuarios con rol de cliente. */
  getAllCustomer() {
    return axios.get(BASE_URL + "/allCustomer/");
  }

  /** Solicita los roles disponibles. */
  getRoles() {
    return axios.get(BASE_URL + "/roles");
  }

  /** Solicita el perfil del usuario autenticado. */
  getPerfil() {
    return axios.get(BASE_URL + "/perfil", { headers: getAuthHeaders() });
  }

  /** Actualiza el perfil del usuario autenticado. */
  updatePerfil(data) {
    return axios.post(BASE_URL + "/updatePerfil", data, { headers: getAuthHeaders() });
  }

  /** Envia los datos necesarios para registrar un usuario publico. */
  createUser(User) {
    return axios.post(BASE_URL, User);
  }

  /** Crea un usuario desde mantenimiento. */
  createUsuario(data) {
    return axios.post(BASE_URL + "/create", data);
  }

  /** Actualiza un usuario desde mantenimiento. */
  updateUsuario(id, data) {
    return axios.post(BASE_URL + "/update/" + id, data);
  }

  /** Desactiva un usuario. */
  deleteUsuario(id) {
    return axios.post(BASE_URL + "/delete/" + id);
  }

  /** Reactiva un usuario. */
  activarUsuario(id) {
    return axios.post(BASE_URL + "/activar/" + id);
  }

  /** Envia las credenciales para autenticar un usuario. */
  loginUser(User) {
    return axios.post(BASE_URL + "/login/", User);
  }
}

export default new UserService();
