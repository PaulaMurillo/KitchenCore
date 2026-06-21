import { useReducer } from "react";
import {
  cartReducer,
  cartInitialState,
  getTotal,
  getCountItems,
  CART_ACTION,
} from "../reducers/cart";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import { CartContext } from "./CartContextDefinition";

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/** Proporciona el estado y las operaciones del carrito a la aplicación. */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  /** Agrega un artículo al carrito y muestra una confirmación. */
  const addItem = (item) => {
    dispatch({ type: CART_ACTION.ADD_ITEM, payload: item });
    toast.success(`${item.name ?? item.nombre ?? "Producto"} fue añadido al carrito`);
  };

  /** Elimina un artículo del carrito y muestra una notificación. */
  const removeItem = (item) => {
    dispatch({ type: CART_ACTION.REMOVE_ITEM, payload: item });
    toast(`${item.name ?? item.nombre ?? "Producto"} fue eliminado del carrito`, {
      icon: <RemoveShoppingCartIcon color="warning" />,
    });
  };

  /** Elimina todos los artículos almacenados en el carrito. */
  const cleanCart = () => {
    dispatch({ type: CART_ACTION.CLEAN_CART });
    toast("El carrito fue reiniciado", {
      icon: <DeleteIcon color="warning" />,
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addItem,
        removeItem,
        cleanCart,
        getTotal,
        getCountItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
