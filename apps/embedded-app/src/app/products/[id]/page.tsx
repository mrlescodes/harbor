"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Form,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

export default function ProductPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  const handleSubmit = () => {
    console.log("Form Submitted");
  };

  return (
    <Page backAction={{ onAction: () => handleBack() }} title="Product Page">
      <Card>
        <Box paddingBlockEnd="400">
          <Text as="h2" variant="headingSm">
            Link to existing product
          </Text>
        </Box>

        <Box maxWidth="320px">
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField label="Shopee Product ID" autoComplete="off" />

              <Button fullWidth variant="primary" submit>
                Submit
              </Button>
            </FormLayout>
          </Form>
        </Box>
      </Card>
    </Page>
  );
}
