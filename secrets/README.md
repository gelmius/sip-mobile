# SIP Mobile Secrets

This directory contains decrypted keypairs for deployment.
Files here are gitignored for security.

## Required Keys

- `dapp-store.json` - Keypair for Solana dApp Store publishing (NFT minting)
  - Address: S1PSkwV3YZD6exNiUEdfTJadyUJ1CDDUgwmQaWB5yie
  - Source: ~/.claude/sip-protocol/keys/solana/dapp-store.json.age

## Decryption

```bash
cd ~/.claude/sip-protocol/keys
./sip-keys.sh decrypt solana/dapp-store.json.age
mv /tmp/sip-key-decrypted.json /Users/rz/local-dev/sip-mobile/secrets/dapp-store.json
```

## Cleanup

After deployment, remove decrypted keys:
```bash
rm -f /Users/rz/local-dev/sip-mobile/secrets/*.json
```
