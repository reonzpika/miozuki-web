# Miozuki Audit — 2026-04-15

## Summary
- **Target:** https://miozuki.co.nz
- **Duration:** 134s
- **Pages crawled:** 19
- **Total findings:** 100
- Critical: 3 | High: 13 | Medium: 81 | Low: 3

Full detail: docs/audit/audit-2026-04-15.json

## Critical (3)

### F092 — cart-drawer [flow-failure]
- **Severity:** critical
- **Tier:** 2
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Cart drawer did not open after clicking cart icon
- **Screenshot:** docs/audit/screenshots/flow-cart-drawer-closed.png

### F093 — cart-drawer [missing-element]
- **Severity:** critical
- **Tier:** 2
- **URL:** https://miozuki.co.nz
- **Message:** Checkout link not visible in cart drawer footer
- **Screenshot:** docs/audit/screenshots/flow-checkout-no-link.png

### F097 — /pages/contact [missing-element]
- **Severity:** critical
- **Tier:** 2
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** Contact form not rendered — page may have returned error (503/404)
- **Screenshot:** docs/audit/screenshots/flow-contact-missing-form.png

## High (13)

### F001 — / [network-error]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=26f6da62-0a4e-4c68-a8cd-5afa73fddcac&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F004 — / [broken-image]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/
- **Message:** 2 broken image(s) detected

### F047 — /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring [js-exception]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring
- **Message:** jdgm is not defined

### F048 — /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring [network-error]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=93d1e7a6-caf0-46b1-9012-1fd9af996033&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F052 — /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring [broken-image]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring
- **Message:** 3 broken image(s) detected

### F053 — /products/classic-moissanite-solitaire-ring [network-error]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=7d697ae9-45e5-4ed1-a5c4-85a556325b8a&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F057 — /products/classic-moissanite-solitaire-ring [broken-image]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** 11 broken image(s) detected

### F058 — /products/pear-cut-pave-moissanite-ring-nz [network-error]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/pear-cut-pave-moissanite-ring-nz
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=ebad507d-9647-4c47-954e-08fc02bab6dc&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F062 — /products/pear-cut-pave-moissanite-ring-nz [broken-image]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/pear-cut-pave-moissanite-ring-nz
- **Message:** 8 broken image(s) detected

### F078 — /products/classic-moissanite-solitaire-ring [network-error]
- **Severity:** high
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=fa255aac-42b1-49e2-ac2e-7195135ccff0&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F089 — /products/classic-moissanite-solitaire-ring [flow-failure]
- **Severity:** high
- **Tier:** 2
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Add to Cart button did not change state after click
- **Screenshot:** docs/audit/screenshots/flow-cart-no-state-change.png

### F099 — /api/subscribe [api-failure]
- **Severity:** high
- **Tier:** 3
- **URL:** https://miozuki.co.nz/api/subscribe
- **Message:** POST /api/subscribe returned 404 (expected 200)

### F100 — /api/contact [api-failure]
- **Severity:** high
- **Tier:** 3
- **URL:** https://miozuki.co.nz/api/contact
- **Message:** POST /api/contact returned 404 (expected 200)

## Medium (81)

### F002 — / [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F003 — / [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F005 — /collections [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=cd0a9adb-3478-4730-818d-65d47cb2882d&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F006 — /collections [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F007 — /collections [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F008 — /collections [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections
- **Message:** 1 broken image(s) detected

### F009 — /pages/about-us [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/about-us
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=0a467bec-61fc-484c-92e1-be175cb922c3&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F010 — /pages/about-us [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/about-us
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F011 — /pages/about-us [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/about-us
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F012 — /pages/contact [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=a3e26d2b-562f-45df-95c8-57f35059cd06&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F013 — /pages/contact [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F014 — /pages/contact [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F015 — /pages/our-founder [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/our-founder
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=44317f70-0311-425c-bbaa-3c6f1d40626b&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F016 — /pages/our-founder [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/our-founder
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F017 — /pages/our-founder [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/our-founder
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F018 — /pages/jewellery-care-guide [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/jewellery-care-guide
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=1fddcb10-5c7f-4f55-bc5f-cfd416585d8e&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F019 — /pages/jewellery-care-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/jewellery-care-guide
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F020 — /pages/jewellery-care-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/jewellery-care-guide
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F021 — /pages/jewellery-care-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/jewellery-care-guide
- **Message:** Failed to load resource: net::ERR_NETWORK_CHANGED

### F022 — /pages/jewellery-care-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/jewellery-care-guide
- **Message:** Failed to load resource: net::ERR_NETWORK_CHANGED

### F023 — /pages/moissanite-faq [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/moissanite-faq
- **Message:** HTTP 404 — https://miozuki.co.nz/cdn/assets/sprites-core-c9exbsc1.svg

### F024 — /pages/moissanite-faq [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/moissanite-faq
- **Message:** Failed to load resource: the server responded with a status of 404 ()

### F025 — /pages/moissanite-faq [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/moissanite-faq
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=75266e9d-ae53-49a4-a4a9-77fde8ac589a&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F026 — /pages/moissanite-faq [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/moissanite-faq
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F027 — /pages/moissanite-faq [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/moissanite-faq
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F028 — /pages/moissanite-faq [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/moissanite-faq
- **Message:** 1 broken image(s) detected

### F029 — /pages/returns-refunds-policy [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/returns-refunds-policy
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=594b8dc1-b7e3-425d-b370-f46aa7ba44bc&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F030 — /pages/returns-refunds-policy [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/returns-refunds-policy
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F031 — /pages/returns-refunds-policy [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/returns-refunds-policy
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F032 — /pages/size-guide [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/size-guide
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=4c0c73d3-d9db-45e3-9bfa-8038368a296f&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F033 — /pages/size-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/size-guide
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F034 — /pages/size-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/size-guide
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F035 — /pages/size-guide [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/size-guide
- **Message:** 1 broken image(s) detected

### F036 — /pages/warranty-cover [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/warranty-cover
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=adcc1987-8a75-4a36-9d3e-c0e5b85116bd&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F037 — /pages/warranty-cover [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/warranty-cover
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F038 — /pages/warranty-cover [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/warranty-cover
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F039 — /pages/warranty-cover [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/warranty-cover
- **Message:** 1 broken image(s) detected

### F040 — /policies/shipping-policy [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/policies/shipping-policy
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=13f39c6e-34e9-4ccf-822b-9707151766d8&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F041 — /policies/shipping-policy [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/policies/shipping-policy
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F042 — /policies/shipping-policy [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/policies/shipping-policy
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F043 — /blogs/news [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=1230455f-6f87-4c77-b816-81b99314c97c&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F044 — /blogs/news [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F045 — /blogs/news [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F046 — /blogs/news [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news
- **Message:** 9 broken image(s) detected

### F049 — /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F050 — /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F051 — /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring
- **Message:** Error producing monorail event MonorailRequestError: Error completing request. A network failure may have prevented the request from completing. Error: TypeError: Failed to fetch. Schemas: shopify_pay_page_load/2.7
    at D.produce (https://cdn.shopify.com/shopifycloud/arrive-server/pay/vite-pay/assets/AnalyticsProvider-BjWWtAtf.js:1:6470)

### F054 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F055 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F056 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Error producing monorail event MonorailRequestError: Error completing request. A network failure may have prevented the request from completing. Error: TypeError: Failed to fetch. Schemas: shopify_pay_page_load/2.7
    at D.produce (https://cdn.shopify.com/shopifycloud/arrive-server/pay/vite-pay/assets/AnalyticsProvider-BjWWtAtf.js:1:6470)

### F059 — /products/pear-cut-pave-moissanite-ring-nz [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/pear-cut-pave-moissanite-ring-nz
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F060 — /products/pear-cut-pave-moissanite-ring-nz [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/pear-cut-pave-moissanite-ring-nz
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F061 — /products/pear-cut-pave-moissanite-ring-nz [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/pear-cut-pave-moissanite-ring-nz
- **Message:** Error producing monorail event MonorailRequestError: Error completing request. A network failure may have prevented the request from completing. Error: TypeError: Failed to fetch. Schemas: shopify_pay_page_load/2.7
    at D.produce (https://cdn.shopify.com/shopifycloud/arrive-server/pay/vite-pay/assets/AnalyticsProvider-BjWWtAtf.js:1:6470)

### F063 — /collections/best-sellers [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/best-sellers
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=2252b69e-69c9-4487-894b-2dac6a5153a3&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F064 — /collections/best-sellers [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/best-sellers
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F065 — /collections/best-sellers [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/best-sellers
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F066 — /collections/best-sellers [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/best-sellers
- **Message:** 3 broken image(s) detected

### F067 — /collections/all-moissanite-pearl-nz [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/all-moissanite-pearl-nz
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=cf00c1d6-4a0f-4df7-aad8-456dfbf94dad&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F068 — /collections/all-moissanite-pearl-nz [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/all-moissanite-pearl-nz
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F069 — /collections/all-moissanite-pearl-nz [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/all-moissanite-pearl-nz
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F070 — /collections/all-moissanite-pearl-nz [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/collections/all-moissanite-pearl-nz
- **Message:** 35 broken image(s) detected

### F071 — /blogs/news/best-bridesmaid-jewellery-gifts-guide [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/best-bridesmaid-jewellery-gifts-guide
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=458bfb07-3226-4ddf-a058-caba5edcca31&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F072 — /blogs/news/best-bridesmaid-jewellery-gifts-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/best-bridesmaid-jewellery-gifts-guide
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F073 — /blogs/news/best-bridesmaid-jewellery-gifts-guide [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/best-bridesmaid-jewellery-gifts-guide
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F074 — /blogs/news/guide-to-our-best-baroque-pearl-earrings [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/guide-to-our-best-baroque-pearl-earrings
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=045e61fb-f63e-4f67-9e0e-cd1841557d0e&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F075 — /blogs/news/guide-to-our-best-baroque-pearl-earrings [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/guide-to-our-best-baroque-pearl-earrings
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F076 — /blogs/news/guide-to-our-best-baroque-pearl-earrings [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/guide-to-our-best-baroque-pearl-earrings
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F077 — /blogs/news/guide-to-our-best-baroque-pearl-earrings [broken-image]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/blogs/news/guide-to-our-best-baroque-pearl-earrings
- **Message:** 1 broken image(s) detected

### F079 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F080 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F081 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Error producing monorail event MonorailRequestError: Error completing request. A network failure may have prevented the request from completing. Error: TypeError: Failed to fetch. Schemas: shopify_pay_page_load/2.7
    at D.produce (https://cdn.shopify.com/shopifycloud/arrive-server/pay/vite-pay/assets/AnalyticsProvider-BjWWtAtf.js:1:6470)

### F085 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Access to XMLHttpRequest at 'https://a.klaviyo.com/onsite/track-analytics?company_id=SyQaz5' from origin 'https://miozuki.co.nz' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

### F086 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Failed to load resource: net::ERR_FAILED

### F087 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Access to XMLHttpRequest at 'https://a.klaviyo.com/onsite/track-analytics?company_id=SyQaz5' from origin 'https://miozuki.co.nz' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

### F088 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Failed to load resource: net::ERR_FAILED

### F090 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Access to XMLHttpRequest at 'https://a.klaviyo.com/onsite/track-analytics?company_id=SyQaz5' from origin 'https://miozuki.co.nz' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

### F091 — /products/classic-moissanite-solitaire-ring [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Failed to load resource: net::ERR_FAILED

### F094 — /pages/contact [network-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** HTTP 403 — https://shop.app/pay/hop?analytics_trace_id=1da2757f-75a4-4f49-8cd1-902846833479&target_origin=https%3A%2F%2Fmiozuki.co.nz&client_handle=nassuu-px.myshopify.com

### F095 — /pages/contact [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** Framing 'https://shop.app/' violates the following Content Security Policy directive: "frame-ancestors 'self' https://shop.app https://admin.shopify.com". The request has been blocked.


### F096 — /pages/contact [console-error]
- **Severity:** medium
- **Tier:** 1
- **URL:** https://miozuki.co.nz/pages/contact
- **Message:** Failed to load resource: the server responded with a status of 403 ()

### F098 — / [flow-failure]
- **Severity:** medium
- **Tier:** 2
- **URL:** https://miozuki.co.nz
- **Message:** Email popup did not appear after 5s on fresh session
- **Screenshot:** docs/audit/screenshots/flow-popup-not-shown.png

## Low (3)

### F082 — /products/classic-moissanite-solitaire-ring [console-warning]
- **Severity:** low
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Multiple versions of Shopify.trackingConsent or Shopify.customerPrivacy loaded -  Version 'v0.1' is already loaded but replacing with version 'v0.1'.

This could result in unexpected behavior. See documentation https://shopify.dev/docs/api/customer-privacy for more information.

### F083 — /products/classic-moissanite-solitaire-ring [console-warning]
- **Severity:** low
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Klaviyo tracking is disabled. To enable, set the cookie "__kla_off" to false. {is_robot: true, __kla_off: }

### F084 — /products/classic-moissanite-solitaire-ring [console-warning]
- **Severity:** low
- **Tier:** 1
- **URL:** https://miozuki.co.nz/products/classic-moissanite-solitaire-ring
- **Message:** Specifying 'overflow: visible' on img, video and canvas tags may cause them to produce visual content outside of the element bounds. See https://github.com/WICG/view-transitions/blob/main/debugging_overflow_on_images.md for details.

## Pages Crawled

| Route | Status | Console Errors | Network Errors | Broken Images |
|-------|--------|---------------|----------------|---------------|
| / | 200 | 2 | 1 | 2 |
| /collections | 200 | 2 | 1 | 1 |
| /pages/about-us | 200 | 2 | 1 | 0 |
| /pages/contact | 200 | 2 | 1 | 0 |
| /pages/our-founder | 200 | 2 | 1 | 0 |
| /pages/jewellery-care-guide | 200 | 4 | 1 | 0 |
| /pages/moissanite-faq | 200 | 3 | 2 | 1 |
| /pages/returns-refunds-policy | 200 | 2 | 1 | 0 |
| /pages/size-guide | 200 | 2 | 1 | 1 |
| /pages/warranty-cover | 200 | 2 | 1 | 1 |
| /policies/shipping-policy | 200 | 2 | 1 | 0 |
| /blogs/news | 200 | 2 | 1 | 9 |
| /products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring | 200 | 3 | 1 | 3 |
| /products/classic-moissanite-solitaire-ring | 200 | 3 | 1 | 11 |
| /products/pear-cut-pave-moissanite-ring-nz | 200 | 3 | 1 | 8 |
| /collections/best-sellers | 200 | 2 | 1 | 3 |
| /collections/all-moissanite-pearl-nz | 200 | 2 | 1 | 35 |
| /blogs/news/best-bridesmaid-jewellery-gifts-guide | 200 | 2 | 1 | 0 |
| /blogs/news/guide-to-our-best-baroque-pearl-earrings | 200 | 2 | 1 | 1 |

## API Checks

| Endpoint | Method | Status | Result | Detail |
|----------|--------|--------|--------|--------|
| /api/subscribe | POST | 404 | unexpected | Unexpected status 404 |
| /api/contact | POST | 404 | unexpected | Unexpected status 404 |