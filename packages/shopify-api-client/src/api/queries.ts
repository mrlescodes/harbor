export const CREATE_ORDER = /* GraphQL */ `
  mutation orderCreate(
    $order: OrderCreateOrderInput!
    $options: OrderCreateOptionsInput
  ) {
    orderCreate(order: $order, options: $options) {
      userErrors {
        field
        message
      }
      order {
        id
      }
    }
  }
`;
