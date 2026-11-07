# Internationalization Configuration

## Overview
`next-intl` routing and request configuration for English and Arabic, including locale validation, message loading, and the fixed application time zone.

## Interface
- `routing` — `defineRouting({ locales: ['en', 'ar'], defaultLocale: 'en' })`. `[routing.ts:routing]`
- default request config — `getRequestConfig(async ({ requestLocale }) => ...)`. `[request.ts:getRequestConfig]`

## Invariants
- Supported locales are exactly `en` and `ar`; `en` is the default. `[routing.ts:routing]`
- An invalid or missing requested locale falls back to `routing.defaultLocale`. `[request.ts:getRequestConfig]`
- Messages are dynamically imported from `../../messages/${locale}.json`. `[request.ts:getRequestConfig]`
- The request config always returns `timeZone: 'Asia/Aden'`. `[request.ts:getRequestConfig]`

## Side Effects
- Dynamically imports the locale message JSON module. `[request.ts:getRequestConfig]`

## Verification
- Run: `pnpm test`
