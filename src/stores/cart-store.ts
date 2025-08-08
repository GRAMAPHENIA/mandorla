import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartFacade } from "../modules/carrito/presentation/facades/cart.facade";
import { CartItemDto } from "../modules/carrito/application";

/**
 * Tipo para el item del carrito en el store (estado de presentación)
 */
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
};

/**
 * Estado del store del carrito
 */
type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
};

/**
 * Acciones del store del carrito
 */
type CartActions = {
  // Operaciones principales
  addItem: (item: Omit<CartItem, "quantity" | "subtotal">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Operaciones de consulta
  loadCart: () => Promise<void>;
  getItemQuantity: (id: string) => number;
  hasItem: (id: string) => boolean;
  
  // Gestión de estado
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

type CartStore = CartState & CartActions;

// Instancia del facade para interactuar con la lógica de dominio
const cartFacade = new CartFacade();

/**
 * Store de Zustand refactorizado para usar servicios de dominio
 * Implementa el patrón Facade para separar estado de presentación de lógica de negocio
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,

      // Operaciones principales
      addItem: async (item) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await cartFacade.addProduct({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image
          });

          if (result.success) {
            await get().loadCart(); // Recargar estado desde el dominio
          } else {
            set({ error: result.message || 'Error al agregar item' });
          }
        } catch (error) {
          set({ error: 'Error inesperado al agregar item' });
          console.error('Error en addItem:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await cartFacade.removeProduct(id);

          if (result.success) {
            await get().loadCart(); // Recargar estado desde el dominio
          } else {
            set({ error: result.message || 'Error al remover item' });
          }
        } catch (error) {
          set({ error: 'Error inesperado al remover item' });
          console.error('Error en removeItem:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (id, quantity) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await cartFacade.updateQuantity(id, quantity);

          if (result.success) {
            await get().loadCart(); // Recargar estado desde el dominio
          } else {
            set({ error: result.message || 'Error al actualizar cantidad' });
          }
        } catch (error) {
          set({ error: 'Error inesperado al actualizar cantidad' });
          console.error('Error en updateQuantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await cartFacade.clearCart();

          if (result.success) {
            set({ 
              items: [], 
              totalItems: 0, 
              totalPrice: 0 
            });
          } else {
            set({ error: result.message || 'Error al limpiar carrito' });
          }
        } catch (error) {
          set({ error: 'Error inesperado al limpiar carrito' });
          console.error('Error en clearCart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Operaciones de consulta
      loadCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const cart = await cartFacade.getCart();
          
          if (cart) {
            const items: CartItem[] = cart.items.map(mapDtoToStoreItem);
            
            set({
              items,
              totalItems: cart.totalItems,
              totalPrice: cart.totalPrice
            });
          } else {
            // Carrito vacío o no existe
            set({
              items: [],
              totalItems: 0,
              totalPrice: 0
            });
          }
        } catch (error) {
          set({ error: 'Error al cargar carrito' });
          console.error('Error en loadCart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getItemQuantity: (id) => {
        const item = get().items.find(item => item.id === id);
        return item ? item.quantity : 0;
      },

      hasItem: (id) => {
        return get().items.some(item => item.id === id);
      },

      // Gestión de estado
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'mandorla-cart-storage',
      // Solo persistir el estado básico, no las funciones
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }),
      // Recargar desde el dominio al hidratar
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recargar desde el dominio después de hidratar
          setTimeout(() => state.loadCart(), 0);
        }
      }
    }
  )
);

/**
 * Mapea un DTO del dominio a un item del store
 */
function mapDtoToStoreItem(dto: CartItemDto): CartItem {
  return {
    id: dto.productId,
    name: dto.name,
    price: dto.price,
    quantity: dto.quantity,
    image: dto.image,
    subtotal: dto.subtotal
  };
}

/**
 * Hook personalizado para operaciones comunes del carrito
 */
export const useCartOperations = () => {
  const store = useCartStore();
  
  return {
    // Estado
    items: store.items,
    totalItems: store.totalItems,
    totalPrice: store.totalPrice,
    isLoading: store.isLoading,
    error: store.error,
    
    // Operaciones
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    loadCart: store.loadCart,
    
    // Consultas
    getItemQuantity: store.getItemQuantity,
    hasItem: store.hasItem,
    isEmpty: store.items.length === 0,
    
    // Gestión de errores
    clearError: store.clearError
  };
};
