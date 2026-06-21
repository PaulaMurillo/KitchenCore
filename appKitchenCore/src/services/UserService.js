import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL + 'user';

class UserService {
  /** Solicita el listado completo de usuarios. */
  getUsers() {
    return axios.get(BASE_URL);
  }
  /** Solicita los datos de un usuario por su ID. */
  getUserById(UserId) {
    return axios.get(BASE_URL + '/' + UserId);
  }
  /** Solicita todos los usuarios con rol de cliente. */
  getAllCustomer() {
    return axios.get(BASE_URL + '/allCustomer/');
  }
  /** Envía los datos necesarios para registrar un usuario. */
  createUser(User) {
    return axios.post(BASE_URL, JSON.stringify(User));
  }
  /** Envía las credenciales para autenticar un usuario. */
  loginUser(User) {
    return axios.post(BASE_URL + '/login/', JSON.stringify(User));
  }
}

export default new UserService();
