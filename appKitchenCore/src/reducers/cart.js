export const cartInitialState = JSON.parse(localStorage.getItem("cart")) || [];

export const CART_ACTION = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAN_CART: "CLEAN_CART",
};

export const updateLocalStorage = (state) => {
  localStorage.setItem("cart", JSON.stringify(state));
};

const calculateSubtotal = (item) => item.price * item.quantity;
const calculateTotal = (cart) =>
  cart.reduce((acc, item) => acc + item.subtotal, 0);

export const cartReducer = (state, action) => {
  const { type: actionType, payload: actionPayload } = action;

  switch (actionType) {
    case CART_ACTION.ADD_ITEM: {
      const { id } = actionPayload;
      const itemInCart = state.findIndex((item) => item.id === id);

      if (itemInCart >= 0) {
        const newState = structuredClone(state);
        newState[itemInCart].quantity += 1;
        newState[itemInCart].subtotal = calculateSubtotal(newState[itemInCart]);
        updateLocalStorage(newState);
        return newState;
      }

      const newState = [
        ...state,
        {
          ...actionPayload,
          quantity: 1,
          subtotal: calculateSubtotal({ ...actionPayload, quantity: 1 }),
        },
      ];
      updateLocalStorage(newState);
      return newState;
    }

    case CART_ACTION.REMOVE_ITEM: {
      const { id } = actionPayload;
      const newState = state.filter((item) => item.id !== id);
      updateLocalStorage(newState);
      return newState;
    }

    case CART_ACTION.CLEAN_CART:
      updateLocalStorage([]);
      return [];

    default:
      return state;
  }
};

export const getTotal = (state) => calculateTotal(state);
export const getCountItems = (state) =>
  state.reduce((acc, item) => acc + item.quantity, 0);
