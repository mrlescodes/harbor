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

export const FIND_ORDER_BY_IDENTIFIER = /* GraphQL */ `
  query FindOrderByIdentifier($identifier: OrderIdentifierInput!) {
    orderByIdentifier(identifier: $identifier) {
      id
      fulfillmentOrders(first: 5) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const CREATE_FULFILLMENT = /* GraphQL */ `
  mutation CreateFulfillment(
    $fulfillment: FulfillmentInput!
    $message: String
  ) {
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
  query GetProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        variants(first: 10) {
          nodes {
            id
            title
          }
        }
      }
    }
  }
`;

export const FIND_PRODUCT_BY_IDENTIFIER = /* GraphQL */ `
  query FindProductByIdentifier($identifier: ProductIdentifierInput!) {
    productByIdentifier(identifier: $identifier) {
      id
      title
      hasOnlyDefaultVariant
      variants(first: 250) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`;
