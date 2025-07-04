/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types';

export type CreateMetafieldDefinitionMutationVariables = AdminTypes.Exact<{
  definition: AdminTypes.MetafieldDefinitionInput;
}>;


export type CreateMetafieldDefinitionMutation = { metafieldDefinitionCreate?: AdminTypes.Maybe<{ createdDefinition?: AdminTypes.Maybe<Pick<AdminTypes.MetafieldDefinition, 'id'>>, userErrors: Array<Pick<AdminTypes.MetafieldDefinitionCreateUserError, 'field' | 'message'>> }> };

export type CreateOrderMutationVariables = AdminTypes.Exact<{
  order: AdminTypes.OrderCreateOrderInput;
  options?: AdminTypes.InputMaybe<AdminTypes.OrderCreateOptionsInput>;
}>;


export type CreateOrderMutation = { orderCreate?: AdminTypes.Maybe<{ order?: AdminTypes.Maybe<Pick<AdminTypes.Order, 'id'>>, userErrors: Array<Pick<AdminTypes.OrderCreateUserError, 'field' | 'message'>> }> };

export type DeleteOrderMutationVariables = AdminTypes.Exact<{
  orderId: AdminTypes.Scalars['ID']['input'];
}>;


export type DeleteOrderMutation = { orderDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.OrderDeletePayload, 'deletedId'>
    & { userErrors: Array<Pick<AdminTypes.OrderDeleteUserError, 'field' | 'message'>> }
  )> };

export type FindOrderByIdentifierQueryVariables = AdminTypes.Exact<{
  identifier: AdminTypes.OrderIdentifierInput;
}>;


export type FindOrderByIdentifierQuery = { orderByIdentifier?: AdminTypes.Maybe<(
    Pick<AdminTypes.Order, 'id'>
    & { fulfillmentOrders: { edges: Array<{ node: Pick<AdminTypes.FulfillmentOrder, 'id'> }> } }
  )> };

export type CreateFulfillmentMutationVariables = AdminTypes.Exact<{
  fulfillment: AdminTypes.FulfillmentInput;
  message?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type CreateFulfillmentMutation = { fulfillmentCreate?: AdminTypes.Maybe<{ fulfillment?: AdminTypes.Maybe<Pick<AdminTypes.Fulfillment, 'id'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
}>;


export type GetProductsQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'id' | 'title'>
      & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'title'>> } }
    )> } };

export type FindProductByIdentifierQueryVariables = AdminTypes.Exact<{
  identifier: AdminTypes.ProductIdentifierInput;
}>;


export type FindProductByIdentifierQuery = { productByIdentifier?: AdminTypes.Maybe<(
    Pick<AdminTypes.Product, 'id' | 'title' | 'hasOnlyDefaultVariant'>
    & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'title'> }> } }
  )> };

interface GeneratedQueryTypes {
  "\n  query FindOrderByIdentifier($identifier: OrderIdentifierInput!) {\n    orderByIdentifier(identifier: $identifier) {\n      id\n      fulfillmentOrders(first: 5) {\n        edges {\n          node {\n            id\n          }\n        }\n      }\n    }\n  }\n": {return: FindOrderByIdentifierQuery, variables: FindOrderByIdentifierQueryVariables},
  "\n  query GetProducts($first: Int!) {\n    products(first: $first) {\n      nodes {\n        id\n        title\n        variants(first: 10) {\n          nodes {\n            id\n            title\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "\n  query FindProductByIdentifier($identifier: ProductIdentifierInput!) {\n    productByIdentifier(identifier: $identifier) {\n      id\n      title\n      hasOnlyDefaultVariant\n      variants(first: 250) {\n        edges {\n          node {\n            id\n            title\n          }\n        }\n      }\n    }\n  }\n": {return: FindProductByIdentifierQuery, variables: FindProductByIdentifierQueryVariables},
}

interface GeneratedMutationTypes {
  "\n  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {\n    metafieldDefinitionCreate(definition: $definition) {\n      createdDefinition {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CreateMetafieldDefinitionMutation, variables: CreateMetafieldDefinitionMutationVariables},
  "\n  mutation CreateOrder(\n    $order: OrderCreateOrderInput!\n    $options: OrderCreateOptionsInput\n  ) {\n    orderCreate(order: $order, options: $options) {\n      order {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CreateOrderMutation, variables: CreateOrderMutationVariables},
  "\n  mutation DeleteOrder($orderId: ID!) {\n    orderDelete(orderId: $orderId) {\n      deletedId\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: DeleteOrderMutation, variables: DeleteOrderMutationVariables},
  "\n  mutation CreateFulfillment(\n    $fulfillment: FulfillmentInput!\n    $message: String\n  ) {\n    fulfillmentCreate(fulfillment: $fulfillment, message: $message) {\n      fulfillment {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CreateFulfillmentMutation, variables: CreateFulfillmentMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
