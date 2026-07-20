import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "upload";

class UploadService {
  /** Carga una imagen local y devuelve la ruta publica que debe guardarse. */
  uploadImage(file, tipo = "imagen") {
    const formData = new FormData();

    formData.append("imagen", file);
    formData.append("tipo", tipo);

    return axios.post(BASE_URL + "/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
}

export default new UploadService();
