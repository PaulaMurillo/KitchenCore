import { createContext, useReducer } from "react";
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

export const CartContext = createContext();

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, cartInitialState);

  const addItem = (item) => {
    dispatch({ type: CART_ACTION.ADD_ITEM, payload: item });
    toast.success(`${item.name ?? item.nombre ?? "Producto"} fue añadido al carrito`);
  };

  const removeItem = (item) => {
    dispatch({ type: CART_ACTION.REMOVE_ITEM, payload: item });
    toast(`${item.name ?? item.nombre ?? "Producto"} fue eliminado del carrito`, {
      icon: <RemoveShoppingCartIcon color="warning" />,
    });
  };

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
