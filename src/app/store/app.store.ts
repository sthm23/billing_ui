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

type AppStoreState = {
  isLoading: boolean;
  filter: { query: string; order: 'asc' | 'desc' };
};

const initialState: AppStoreState = {
  isLoading: false,
  filter: { query: '', order: 'asc' },
};

enum APP_ENTITY {
  PRODUCT = 'product',
  ORDER = 'order',
  PAYMENT = 'payment',
  USER = 'user'
}

// const selectProductId: SelectEntityId<ProductType> = (product) => product._id;
// const productsConfig = entityConfig({
//   entity: type<ProductType>(),
//   collection: APP_ENTITY.PRODUCT,
//   selectId: selectProductId,
// });

// const selectOrderId: SelectEntityId<OrderType> = (order) => order._id;
// const ordersConfig = entityConfig({
//   entity: type<OrderType>(),
//   collection: APP_ENTITY.ORDER,
//   selectId: selectOrderId,
// });

// const selectPaymentId: SelectEntityId<PaymentDetails> = (payment) => payment._id;
// const paymentsConfig = entityConfig({
//   entity: type<PaymentDetails>(),
//   collection: APP_ENTITY.PAYMENT,
//   selectId: selectPaymentId,
// });

// const selectUserId: SelectEntityId<UserType> = (user) => user._id;
// const usersConfig = entityConfig({
//   entity: type<UserType>(),
//   collection: APP_ENTITY.USER,
//   selectId: selectUserId,
// });

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // withEntities(productsConfig),
  // withEntities(ordersConfig),
  // withEntities(paymentsConfig),
  // withEntities(usersConfig),

  withMethods((store) => ({

    stopLoader() {
      patchState(store, () => ({ isLoading: false }))
    },

    startLoader() {
      patchState(store, () => ({ isLoading: true }))
    },

    // setProducts(products: ProductType[]) {
    //   patchState(store, addEntities(products, productsConfig))
    // },

    // addProduct(product: ProductType) {
    //   patchState(store, addEntity(product, productsConfig))
    // },

    // updateProduct(product: ProductType) {
    //   patchState(store, updateEntity(
    //     {
    //       id: product._id,
    //       changes: { ...product }
    //     },
    //     productsConfig));
    // },

    // setOrders(orders: OrderType[]) {
    //   patchState(store, addEntities(orders, ordersConfig))
    // },

    // addOrder(order: OrderType) {
    //   patchState(store, addEntity(order, ordersConfig))
    // },

    // updateOrder(order: OrderType) {
    //   patchState(store, updateEntity(
    //     {
    //       id: order._id,
    //       changes: { ...order }
    //     },
    //     ordersConfig));
    // },

    // removeProduct(id: string) {
    //   patchState(store, removeEntity(id, productsConfig))
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
    //       id: payment._id,
    //       changes: { ...payment }
    //     },
    //     paymentsConfig));
    // },

    // removePayment(id: string) {
    //   patchState(store, removeEntity(id, paymentsConfig))
    // },

    // // User methods
    // setUsers(users: UserType[]) {
    //   patchState(store, addEntities(users, usersConfig))
    // },

    // addUser(user: UserType) {
    //   patchState(store, addEntity(user, usersConfig))
    // },

    // updateUser(user: UserType) {
    //   patchState(store, updateEntity(
    //     {
    //       id: user._id,
    //       changes: { ...user }
    //     },
    //     usersConfig));
    // },

    // removeUser(id: string) {
    //   patchState(store, removeEntity(id, usersConfig))
    // }

  })
  )
)
