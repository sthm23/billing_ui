import { patchState, signalStore, type, withMethods, withState } from '@ngrx/signals';
import {
  addEntities,
  addEntity,
  entityConfig,
  removeEntity,
  SelectEntityId,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

type AppStoreState = {
  storeId: string | null;
  isLoading: boolean;
  selectedOwnerId: string | null;
  filter: { query: string; order: 'asc' | 'desc' };
};

const initialState: AppStoreState = {
  storeId: null,
  isLoading: false,
  selectedOwnerId: null,
  filter: { query: '', order: 'asc' },
};

enum APP_ENTITY {
  PRODUCT = 'product',
  ORDER = 'order',
  PAYMENT = 'payment',
  USER = 'user'
}

const selectProductId: SelectEntityId<Product> = (product) => product.id;
const productsConfig = entityConfig({
  entity: type<Product>(),
  collection: APP_ENTITY.PRODUCT,
  selectId: selectProductId,
});

// const selectOrderId: SelectEntityId<OrderType> = (order) => order.id;
// const ordersConfig = entityConfig({
//   entity: type<OrderType>(),
//   collection: APP_ENTITY.ORDER,
//   selectId: selectOrderId,
// });

// const selectPaymentId: SelectEntityId<PaymentDetails> = (payment) => payment.id;
// const paymentsConfig = entityConfig({
//   entity: type<PaymentDetails>(),
//   collection: APP_ENTITY.PAYMENT,
//   selectId: selectPaymentId,
// });

const selectUserId: SelectEntityId<User> = (user) => user.id;
const usersConfig = entityConfig({
  entity: type<User>(),
  collection: APP_ENTITY.USER,
  selectId: selectUserId,
});

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withEntities(productsConfig),
  // withEntities(ordersConfig),
  // withEntities(paymentsConfig),
  withEntities(usersConfig),

  withMethods((store) => ({

    stopLoader() {
      patchState(store, () => ({ isLoading: false }))
    },

    startLoader() {
      patchState(store, () => ({ isLoading: true }))
    },

    setOwnerId(ownerId: string) {
      patchState(store, () => ({ selectedOwnerId: ownerId }))
    },

    setStoreId(storeId: string) {
      patchState(store, () => ({ storeId: storeId }))
    },

    setProducts(products: Product[]) {
      patchState(store, addEntities(products, productsConfig))
    },

    addProduct(product: Product) {
      patchState(store, addEntity(product, productsConfig))
    },

    updateProduct(product: Product) {
      patchState(store, updateEntity(
        {
          id: product.id,
          changes: { ...product }
        },
        productsConfig));
    },

    removeProduct(id: string) {
      patchState(store, removeEntity(id, productsConfig))
    },

    // setOrders(orders: OrderType[]) {
    //   patchState(store, addEntities(orders, ordersConfig))
    // },

    // addOrder(order: OrderType) {
    //   patchState(store, addEntity(order, ordersConfig))
    // },

    // updateOrder(order: OrderType) {
    //   patchState(store, updateEntity(
    //     {
    //       id: order.id,
    //       changes: { ...order }
    //     },
    //     ordersConfig));
    // },


    // removeOrder(id: string) {
    //   patchState(store, removeEntity(id, ordersConfig))
    // },
    // setPayments(payments: PaymentDetails[]) {
    //   patchState(store, addEntities(payments, paymentsConfig))
    // },
    // addPayment(payment: PaymentDetails) {
    //   patchState(store, addEntity(payment, paymentsConfig))
    // },

    // updatePayment(payment: PaymentDetails) {
    //   patchState(store, updateEntity(
    //     {
    //       id: payment.id,
    //       changes: { ...payment }
    //     },
    //     paymentsConfig));
    // },

    // removePayment(id: string) {
    //   patchState(store, removeEntity(id, paymentsConfig))
    // },

    // User methods
    setUsers(users: User[]) {
      patchState(store, addEntities(users, usersConfig))
    },

    addUser(user: User) {
      patchState(store, addEntity(user, usersConfig))
    },

    updateUser(user: User) {
      patchState(store, updateEntity(
        {
          id: user.id,
          changes: { ...user }
        },
        usersConfig));
    },

    removeUser(id: string) {
      patchState(store, removeEntity(id, usersConfig))
    }

  })
  )
)
