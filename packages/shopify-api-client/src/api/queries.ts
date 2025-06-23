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
