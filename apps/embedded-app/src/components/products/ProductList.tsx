"use client";

import { useRouter } from "next/navigation";
import { Card, ResourceItem, ResourceList, Text } from "@shopify/polaris";

interface ProductListProps {
  products: {
    id: string;
    name: string;
  }[];
}

export const ProductList = (props: ProductListProps) => {
  const { products } = props;

  const router = useRouter();

  const handleClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  return (
    <Card padding="0">
      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(product) => {
          const { id, name } = product;

          return (
            <ResourceItem
              id={id}
              key={id}
              onClick={() => handleClick(id)}
              accessibilityLabel={`View details for ${name}`}
            >
              <Text variant="bodyMd" fontWeight="bold" as="h3">
                {name}
              </Text>
            </ResourceItem>
          );
        }}
      />
    </Card>
  );
};
