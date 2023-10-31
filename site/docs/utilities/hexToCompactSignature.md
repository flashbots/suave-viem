---
head:
  - - meta
    - property: og:title
      content: hexToCompactSignature
  - - meta
    - name: description
      content: Parses a hex formatted compact signature into a structured compact signature.
  - - meta
    - property: og:description
      content: Parses a hex formatted compact signature into a structured compact signature.

---

# hexToCompactSignature

Parses a hex formatted compact signature into a structured ("split") compact signature.

## Import

```ts
import { hexToCompactSignature } from 'viem'
```

## Usage

```ts
import { hexToCompactSignature } from 'viem'

hexToCompactSignature('0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793') // [!code focus:7]
/**
 * {
 *   r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
 *   yParityAndS: '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793'
 * }
 */
```

## Returns

[`CompactSignature`](/docs/glossary/types#compactsignature)

The structured ("split") compact signature.

## Parameters

### signatureHex

The compact signature in hex format.

- **Type:** [`Hex`](/docs/glossary/types#hex)
