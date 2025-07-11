"use client";

import { useRouter } from "next/navigation";
import { Card, ResourceItem, ResourceList, Text } from "@shopify/polaris";

import { parseGid } from "~/lib/shopify/utils";

interface ProductListProps {
  products: {
    id: string;
    title: string;
  }[];
}

export const ProductList = (props: ProductListProps) => {
  const { products } = props;

  const router = useRouter();

  const handleClick = (productId: string) => {
    const parsedId = parseGid(productId);
    if (parsedId) {
      router.push(`/products/${parsedId}`);
    } else {
      // TODO: display ui error and log to service
    }
  };

  return (
    <Card padding="0">
      <ResourceList
        resourceName={{ singular: "product", plural: "products" }}
        items={products}
        renderItem={(product) => {
          const { id, title } = product;

          return (
            <ResourceItem
              id={id}
              key={id}
              onClick={() => handleClick(id)}
              accessibilityLabel={`View details for ${title}`}
            >
              <Text variant="bodyMd" fontWeight="bold" as="h3">
                {title}
              </Text>
            </ResourceItem>
          );
        }}
      />
    </Card>
  );
};
