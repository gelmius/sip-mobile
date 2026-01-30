# Store Submission Preparation

**App:** SIP Privacy
**Version:** 0.1.5
**Bundle ID:** org.sip-protocol.privacy (iOS) / org.sip_protocol.privacy (Android)

---

## Asset Requirements

### Icons

| Platform | Size | Format | Status |
|----------|------|--------|--------|
| iOS App Store | 1024x1024 | PNG (no alpha) | TODO - Need upscale |
| Google Play | 512x512 | PNG | DONE (assets/icon.png) |
| Solana dApp Store | 512x512 | PNG | DONE (assets/icon.png) |
| Adaptive Icon (Android) | 1024x1024 foreground | PNG | TODO - Need upscale |

**Current icon:** 512x512 - needs upscaling to 1024x1024 for iOS

### Screenshots Required

| Platform | Device | Resolution | Count | Status |
|----------|--------|------------|-------|--------|
| iOS | 6.7" (iPhone 15 Pro Max) | 1290x2796 | 3-10 | TODO |
| iOS | 6.5" (iPhone 11 Pro Max) | 1284x2778 | 3-10 | TODO |
| iOS | 5.5" (iPhone 8 Plus) | 1242x2208 | 3-10 | TODO |
| iOS | 12.9" iPad Pro | 2048x2732 | 3-10 | OPTIONAL |
| Google Play | Phone | Any (16:9) | 2-8 | TODO |
| Google Play | 7" Tablet | 1024x600 | 1-8 | OPTIONAL |
| Solana dApp | Phone | 1080x1920 | 3-5 | TODO |

### Feature Graphic (Google Play)

- Size: 1024x500 px
- Status: TODO

---

## Screenshot Plan

Capture these 5 key screens on a real device or simulator:

1. **Home** - Dashboard with balance, quick actions
2. **Send** - Shielded payment form with privacy toggle
3. **Receive** - QR code with stealth address
4. **Swap** - Jupiter DEX with privacy option
5. **Settings** - Privacy provider selection

---

## Store Listings

### iOS App Store

See `store/ios/metadata.json`

### Google Play

See `store/android/metadata.json`

### Solana dApp Store

See `store/solana-dapp-store/metadata.json`

---

## Submission Checklist

### Pre-Submission
- [ ] Upscale icon to 1024x1024
- [ ] Capture screenshots on real device
- [ ] Create feature graphic (Google Play)
- [ ] Review all metadata text
- [ ] Test production build on device
- [ ] Verify deep links work

### iOS
- [ ] Create App Store Connect listing
- [ ] Upload 1024x1024 icon
- [ ] Upload screenshots for required devices
- [ ] Fill metadata (description, keywords, etc.)
- [ ] Submit for review

### Google Play
- [ ] Create Google Play Console listing
- [ ] Upload 512x512 icon
- [ ] Upload feature graphic
- [ ] Upload screenshots
- [ ] Fill store listing
- [ ] Submit for review

### Solana dApp Store
- [ ] Create listing at https://dappstore.solana.com/submit
- [ ] Upload icon and screenshots
- [ ] Fill metadata
- [ ] Submit for review
