export const CREATE_METAFIELD_DEFINITION = /* GraphQL */ `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CREATE_ORDER = /* GraphQL */ `
  mutation CreateOrder(
    $order: OrderCreateOrderInput!
    $options: OrderCreateOptionsInput
  ) {
    orderCreate(order: $order, options: $options) {
      order {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CANCEL_ORDER = /* GraphQL */ `
  mutation CancelOrder(
    $notifyCustomer: Boolean
    $orderId: ID!
    $reason: OrderCancelReason!
    $refund: Boolean!
    $restock: Boolean!
    $staffNote: String
  ) {
    orderCancel(
      notifyCustomer: $notifyCustomer
      orderId: $orderId
      reason: $reason
      refund: $refund
      restock: $restock
      staffNote: $staffNote
    ) {
      job {
        done
        id
      }
      orderCancelUserErrors {
        field
        message
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_ORDER = /* GraphQL */ `
  mutation DeleteOrder($orderId: ID!) {
    orderDelete(orderId: $orderId) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

export const FIND_ORDER_BY_CUSTOM_ID = /* GraphQL */ `
  query FindOrderByCustomId($identifier: OrderIdentifierInput!) {
    orderByIdentifier(identifier: $identifier) {
      id
      fulfillmentOrders(first: 5) {
        edges {
          node {
            id
            status
          }
        }
      }
    }
  }
`;

export const FULFILL_ORDER = /* GraphQL */ `
  mutation FulfillOrder($fulfillment: FulfillmentInput!, $message: String) {
    fulfillmentCreate(fulfillment: $fulfillment, message: $message) {
      fulfillment {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_PRODUCTS = /* GraphQL */ `
  query GetProducts {
    products(first: 10) {
      nodes {
        id
        title
        variants(first: 10) {
          nodes {
            id
          }
        }
      }
    }
  }
`;

export const FIND_PRODUCT_BY_ID = /* GraphQL */ `
  query FindProductById($identifier: ProductIdentifierInput!) {
    productByIdentifier(identifier: $identifier) {
      id
      handle
      title
      hasOnlyDefaultVariant
      variants(first: 250) {
        edges {
          node {
            id
            title
            sku
          }
        }
      }
    }
  }
`;
