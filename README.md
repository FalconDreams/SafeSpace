# SafeSpace

SafeSpace is a renter-focused reporting tool for Boulder housing health and safety issues.

## What it does

- Guides renters through emergency and non-emergency issue reporting
- Lets users submit reports with optional anonymous display
- Publishes reports to on-chain infrastructure for durable public records
- Supports landlord rebuttals with transparent, paired context

## Privacy and trust model (important)

SafeSpace is designed to reduce takedown and tampering risk, but it is **not** a guarantee of perfect anonymity, uncensorability, or untraceability.

Using the app can involve third-party services (for example Privy, Stripe, RPC providers, gateways, and hosting/CDN layers) that may process metadata such as IP address, timestamps, device/browser details, and transaction data. On-chain transactions are public by default.

For explicit trust boundaries and data flow, see:

- `CONTROL_CENTER/policies/privacy-threat-model.md`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Smart contracts

```bash
npx hardhat compile
npx hardhat test
```
