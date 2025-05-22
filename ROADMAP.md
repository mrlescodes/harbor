# Roadmap

- [ ] Finish implementing Shopee oAuth code to Shopee API Client package
- [ ] Update app to use new oAuth flow (remove storage from inside app) 
    - [ ] Add correct error handling to Shopee Authorisation flow
    - [ ] 100 correct Shopee flow


## Apps: Embedded App

- [ ] Endpoint for receiving shopee push webhooks
    - [ ] Handle webook message
    - [ ] If it's an order create message then use shopee api client to fetch matching orders
    - [ ] Validate the received orders
    - [ ] Use Shopify API client to create an order to match that on the marketplace
        - [ ] Find product by sku?
        - [ ] Find customer by some identifiable?
- [ ] Create Shopify API Client package and extract lib code?


## Packages: UI

- [ ] Should this include Polaris UI components?
    - [ ] App Bridge implementation from embedded-app


## Packages: Utils

- [ ] Collection of no dependency utils

