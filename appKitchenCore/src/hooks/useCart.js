import { useContext } from 'react';
import { CartContext } from '../context/CartContextDefinition';

/** Facilita el acceso seguro al contexto global del carrito. */
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe utilizarse con el CartProvider');
  }
  return context;
};



