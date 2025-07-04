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

export type CancelOrderMutationVariables = AdminTypes.Exact<{
  orderId: AdminTypes.Scalars['ID']['input'];
  notifyCustomer?: AdminTypes.InputMaybe<AdminTypes.Scalars['Boolean']['input']>;
  refundMethod: AdminTypes.OrderCancelRefundMethodInput;
  restock: AdminTypes.Scalars['Boolean']['input'];
  reason: AdminTypes.OrderCancelReason;
  staffNote?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type CancelOrderMutation = { orderCancel?: AdminTypes.Maybe<{ job?: AdminTypes.Maybe<Pick<AdminTypes.Job, 'done' | 'id'>>, orderCancelUserErrors: Array<Pick<AdminTypes.OrderCancelUserError, 'field' | 'message'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type DeleteOrderMutationVariables = AdminTypes.Exact<{
  orderId: AdminTypes.Scalars['ID']['input'];
}>;


export type DeleteOrderMutation = { orderDelete?: AdminTypes.Maybe<(
    Pick<AdminTypes.OrderDeletePayload, 'deletedId'>
    & { userErrors: Array<Pick<AdminTypes.OrderDeleteUserError, 'field' | 'message'>> }
  )> };

export type FindOrderByCustomIdQueryVariables = AdminTypes.Exact<{
  identifier: AdminTypes.OrderIdentifierInput;
}>;


export type FindOrderByCustomIdQuery = { orderByIdentifier?: AdminTypes.Maybe<(
    Pick<AdminTypes.Order, 'id'>
    & { fulfillmentOrders: { edges: Array<{ node: Pick<AdminTypes.FulfillmentOrder, 'id' | 'status'> }> } }
  )> };

export type FulfillOrderMutationVariables = AdminTypes.Exact<{
  fulfillment: AdminTypes.FulfillmentInput;
  message?: AdminTypes.InputMaybe<AdminTypes.Scalars['String']['input']>;
}>;


export type FulfillOrderMutation = { fulfillmentCreate?: AdminTypes.Maybe<{ fulfillment?: AdminTypes.Maybe<Pick<AdminTypes.Fulfillment, 'id'>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type GetProductsQueryVariables = AdminTypes.Exact<{
  first: AdminTypes.Scalars['Int']['input'];
}>;


export type GetProductsQuery = { products: { nodes: Array<(
      Pick<AdminTypes.Product, 'id' | 'title'>
      & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id'>> } }
    )> } };

export type FindProductByIdQueryVariables = AdminTypes.Exact<{
  identifier: AdminTypes.ProductIdentifierInput;
}>;


export type FindProductByIdQuery = { productByIdentifier?: AdminTypes.Maybe<(
    Pick<AdminTypes.Product, 'id' | 'handle' | 'title' | 'hasOnlyDefaultVariant'>
    & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'sku'> }> } }
  )> };

interface GeneratedQueryTypes {
  "\n  query FindOrderByCustomId($identifier: OrderIdentifierInput!) {\n    orderByIdentifier(identifier: $identifier) {\n      id\n      fulfillmentOrders(first: 5) {\n        edges {\n          node {\n            id\n            status\n          }\n        }\n      }\n    }\n  }\n": {return: FindOrderByCustomIdQuery, variables: FindOrderByCustomIdQueryVariables},
  "\n  query GetProducts($first: Int!) {\n    products(first: $first) {\n      nodes {\n        id\n        title\n        variants(first: 10) {\n          nodes {\n            id\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "\n  query FindProductById($identifier: ProductIdentifierInput!) {\n    productByIdentifier(identifier: $identifier) {\n      id\n      handle\n      title\n      hasOnlyDefaultVariant\n      variants(first: 250) {\n        edges {\n          node {\n            id\n            title\n            sku\n          }\n        }\n      }\n    }\n  }\n": {return: FindProductByIdQuery, variables: FindProductByIdQueryVariables},
}

interface GeneratedMutationTypes {
  "\n  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {\n    metafieldDefinitionCreate(definition: $definition) {\n      createdDefinition {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CreateMetafieldDefinitionMutation, variables: CreateMetafieldDefinitionMutationVariables},
  "\n  mutation CreateOrder(\n    $order: OrderCreateOrderInput!\n    $options: OrderCreateOptionsInput\n  ) {\n    orderCreate(order: $order, options: $options) {\n      order {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CreateOrderMutation, variables: CreateOrderMutationVariables},
  "\n  mutation CancelOrder(\n    $orderId: ID!\n    $notifyCustomer: Boolean\n    $refundMethod: OrderCancelRefundMethodInput!\n    $restock: Boolean!\n    $reason: OrderCancelReason!\n    $staffNote: String\n  ) {\n    orderCancel(\n      orderId: $orderId\n      notifyCustomer: $notifyCustomer\n      refundMethod: $refundMethod\n      restock: $restock\n      reason: $reason\n      staffNote: $staffNote\n    ) {\n      job {\n        done\n        id\n      }\n      orderCancelUserErrors {\n        field\n        message\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CancelOrderMutation, variables: CancelOrderMutationVariables},
  "\n  mutation DeleteOrder($orderId: ID!) {\n    orderDelete(orderId: $orderId) {\n      deletedId\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: DeleteOrderMutation, variables: DeleteOrderMutationVariables},
  "\n  mutation FulfillOrder($fulfillment: FulfillmentInput!, $message: String) {\n    fulfillmentCreate(fulfillment: $fulfillment, message: $message) {\n      fulfillment {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: FulfillOrderMutation, variables: FulfillOrderMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
