"use client";

import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@harbor/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@harbor/ui/form";
import { Input } from "@harbor/ui/input";

/**
 * For products without variants we need to store:
 *
 * shopifyProductId
 * shopifyVariantId
 * marketplaceProductId
 *
 * shopifyProductId & shopifyVariantId are in the product details response already.
 * marketplaceProductId need to be collected from the form
 *
 *
 * For products with variants we need to store:
 *
 * shopifyProductId
 * shopifyVariantId
 * marketplaceProductId
 * marketplaceVariantId
 *
 * shopifyProductId & shopifyVariantId are in the product details response already.
 * marketplaceProductId & marketplaceVariantId need to be collected from the form
 */

interface MarketplaceProductMappingFormProps {
  hasOnlyDefaultVariant: boolean;
  marketplaceProductId?: number;
  variants: {
    shopifyVariantTitle: string;
    shopifyVariantId: number;
    marketplaceVariantId: string;
    hasExistingMapping: boolean;
  }[];
  onSubmit: (values: unknown) => void;
}

export const MarketplaceProductMappingForm = (
  props: MarketplaceProductMappingFormProps,
) => {
  const { hasOnlyDefaultVariant, marketplaceProductId, variants, onSubmit } =
    props;

  const form = useForm({
    defaultValues: {
      marketplaceProductId: marketplaceProductId ?? "",
      variants,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Marketplace Product ID Input */}
        <FormField
          control={form.control}
          name="marketplaceProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marketplace Product ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter marketplace product ID" />
              </FormControl>
              <FormDescription>
                {hasOnlyDefaultVariant
                  ? "This product has no variants, only the marketplace product ID is needed."
                  : "This marketplace product ID will be used to lookup variants for all product variants below."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Only show variants section if there are variants */}
        {!hasOnlyDefaultVariant && (
          <>
            {/* Separator */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Product Variants</h3>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{field.shopifyVariantTitle}</h3>
                  </div>

                  {field.hasExistingMapping && (
                    <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                      Already Mapped
                    </span>
                  )}
                </div>

                {/* Marketplace Variant ID Input */}
                <FormField
                  control={form.control}
                  name={`variants.${index}.marketplaceVariantId`}
                  render={({ field: fieldProps }) => (
                    <FormItem>
                      <FormLabel>Marketplace Variant ID</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          placeholder="Enter marketplace variant ID"
                          disabled={field.hasExistingMapping}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </>
        )}

        {/* Submit Section */}
        <div className="flex items-center justify-between border-t pt-6">
          <div className="space-x-3">
            <Button type="button" onClick={() => form.reset()}>
              Reset
            </Button>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : hasOnlyDefaultVariant
                  ? "Save Product Mapping"
                  : "Save Mappings"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
