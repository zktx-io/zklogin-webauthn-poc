![sui-overflow-2024-2](https://github.com/user-attachments/assets/6f325d33-baca-4adc-8723-333f67895e05)

|   SIP-Number | <Leave this blank; it will be assigned by a SIP Editor>                            |
| -----------: | :--------------------------------------------------------------------------------- |
|        Title | Adding WebAuthn Support to zkLogin                                                 |
|  Description | Proposes adding WebAuthn support to zkLogin for enhanced security and convenience. |
|       Author | DaoAuth                                                                            |
|       Editor | <Leave this blank; it will be assigned by a SIP Editor>                            |
|         Type | Standard                                                                           |
|     Category | Interface                                                                          |
|      Created | 2024-05-21                                                                         |
| Comments-URI | <Leave this blank; it will be assigned by a SIP Editor>                            |
|       Status | <Leave this blank; it will be assigned by a SIP Editor>                            |
|     Requires | <Optional; SIP number(s), comma separated>                                         |

## Abstract

This SIP proposes adding WebAuthn support to zkLogin, allowing the use of WebAuthn authenticators for managing ephemeral keys. This integration aims to leverage the security and convenience of WebAuthn to enhance zkLogin’s functionality, making it more accessible and user-friendly.

## Motivation

WebAuthn is an advanced authentication technology designed to solve modern password management issues, and it is expected to significantly enhance the zkLogin user experience. zkLogin already offers significant advantages, such as ease of use, speed, and freedom from mnemonic management. However, by integrating WebAuthn to manage ephemeral keys, zkLogin can unlock even greater potential. WebAuthn’s secure key management and user familiarity with web2-like flows can reduce the entry barriers for blockchain users. Adding WebAuthn should be straightforward due to its widely accepted standards and implementation.

Currently, Sui does not support WebAuthn signatures, and zkLogin manages ephemeral KeyPairs by caching them in non-secure areas, which can pose security risks. To address these issues, a proof of concept showcasing the exceptional user experience that WebAuthn integration will bring is available. This integration will provide robust security for managing ephemeral KeyPairs, elevating the zkLogin user experience to new heights. As a result, user convenience and security will be significantly enhanced, leading to broader adoption and improved user satisfaction with zkLogin.

### Caching the ephemeral private key and ZK proof

For detailed information on caching the ephemeral private key and ZK proof, please refer to the relevant section in [the zkLogin documentation](https://docs.sui.io/guides/developer/cryptography/zklogin-integration#caching-the-ephemeral-private-key-and-zk-proof).

In summary, each ZK proof is tied to an ephemeral key pair, allowing you to reuse the proof to sign multiple transactions until the ephemeral key pair expires. It’s important to treat the ephemeral key pair as a secret, similar to a key pair in a traditional wallet. If both the ephemeral private key and ZK proof are exposed, an attacker could sign transactions on behalf of the user.

### Solution: WebAuthn

WebAuthn offers a robust solution to this issue. By integrating WebAuthn, ephemeral keys can be securely managed and stored within hardware-backed authenticators, significantly enhancing the security of zkLogin. WebAuthn authenticators handle private keys securely, preventing unauthorized access and ensuring that ephemeral keys remain confidential. This integration not only addresses the security concerns of caching ephemeral keys but also simplifies the user experience, making zkLogin more accessible and user-friendly.

## Specification

To support WebAuthn in zkLogin, the following two options are proposed:

1. **Add a new schema for WebAuthn signatures in the [Signatures](https://docs.sui.io/concepts/cryptography/transaction-auth/signatures) module:**

   - Define a new signature type for WebAuthn that accommodates the specific data structures used in WebAuthn authentication, such as `algorithm`, `authenticatorData`, and `clientDataJSON`.

2. **Introduce optional attributes in zkLogin to support WebAuthn:**
   - Add fields for storing WebAuthn credentials, managing authentication challenges, and handling the response data from WebAuthn authenticators.

### Authentication Flow

![process](./public/process.svg)

- **User Authentication:**
  - Use OpenID for initial user authentication.
  - Integrate WebAuthn for managing ephemeral keys.
  - Ensure secure storage and management of keys within hardware security elements, using devices like fingerprint scanners and NFC.

This approach will allow zkLogin to utilize WebAuthn for ephemeral key management, improving security and user experience.

## Rationale

The integration of WebAuthn with zkLogin is proposed to enhance user experience and security by leveraging the widely accepted WebAuthn standard. The key reasons for this choice are as follows:

1. **User Experience Enhancement:** WebAuthn allows for seamless, passwordless authentication which users are already familiar with from Web2 applications. This reduces the learning curve and makes blockchain technology more accessible to non-technical users.

2. **Security Improvement:** WebAuthn uses hardware-backed keys, which are more secure than traditional methods like localStorage for managing ephemeral keys. This significantly reduces the risk of key compromise.

3. **Technical Feasibility:** WebAuthn's implementation in zkLogin can be achieved by adding a new signature schema and optional attributes for managing WebAuthn credentials and responses.

4. **Alternative Analysis:** While there is an ongoing [proposal](https://github.com/sui-foundation/sips/pull/9) to add WebAuthn as a new signature schema, this SIP specifically focuses on integrating WebAuthn with zkLogin. If the WebAuthn signature schema is implemented first, this proposal can be discarded. However, considering the potential use cases of WebAuthn with zkLogin, prioritizing this integration is a viable and beneficial option.

This rationale outlines the reasons behind the design choices, emphasizing the benefits of improved user experience and security, along with the technical feasibility.

## Implementation

### SDK

#### ZkLoginSignature

```typescript
// https://github.com/MystenLabs/sui/blob/main/sdk/typescript/src/zklogin/bcs.ts
// https://github.com/zktx-io/zklogin-webauthn-poc/blob/main/src/component/zkLogin/webAuthn/bcs.ts

const zkLoginSignature = bcs.struct('ZkLoginSignature', {
  inputs: bcs.struct('ZkLoginSignatureInputs', {
    proofPoints: bcs.struct('ZkLoginSignatureInputsProofPoints', {
      a: bcs.vector(bcs.string()),
      b: bcs.vector(bcs.vector(bcs.string())),
      c: bcs.vector(bcs.string()),
    }),
    issBase64Details: bcs.struct('ZkLoginSignatureInputsClaim', {
      value: bcs.string(),
      indexMod4: bcs.u8(),
    }),
    headerBase64: bcs.string(),
    addressSeed: bcs.string(),
  }),
  maxEpoch: bcs.u64(),
  userSignature: bcs.vector(bcs.u8()),

  // option for webAuthn
  webAuthn: bcs.option(
    bcs.struct('ZkLoginWebAuthn', {
      clientData: bcs.vector(bcs.u8()),
      authenticatorData: bcs.vector(bcs.u8()),
    }),
  ),
  // option for webAuthn
});
```

#### getZkLoginSignatureBytes

```typescript
// https://github.com/MystenLabs/sui/blob/main/sdk/typescript/src/zklogin/signature.ts
// https://github.com/zktx-io/zklogin-webauthn-poc/blob/main/src/component/zkLogin/webAuthn/signature.ts

type ZkLoginSignature = InferBcsInput<typeof zkLoginSignature>;
interface ZkLoginSignatureExtended
  extends Pick<ZkLoginSignature, 'inputs' | 'maxEpoch'> {
  userSignature: string | ZkLoginSignature['userSignature'];

  // option for webAuthn
  webAuthn?: {
    clientData: string | Uint8Array;
    authenticatorData: string | Uint8Array;
  };
  // option for webAuthn
}

function getZkLoginSignatureBytes({
  inputs,
  maxEpoch,
  userSignature,
  webAuthn,
}: ZkLoginSignatureExtended) {
  return zkLoginSignature
    .serialize(
      {
        inputs,
        maxEpoch,
        userSignature:
          typeof userSignature === 'string'
            ? fromB64(userSignature)
            : userSignature,

        // option for webAuthn
        webAuthn: !webAuthn
          ? webAuthn
          : {
              clientData:
                typeof webAuthn.clientData === 'string'
                  ? fromB64(webAuthn.clientData)
                  : webAuthn.clientData,
              authenticatorData:
                typeof webAuthn.authenticatorData === 'string'
                  ? fromB64(webAuthn.authenticatorData)
                  : webAuthn.authenticatorData,
            },
        // option for webAuthn
      },
      { maxSize: 2048 },
    )
    .toBytes();
}

export function getZkLoginSignature({
  inputs,
  maxEpoch,
  userSignature,
  webAuthn, // option for webAuthn
}: ZkLoginSignatureExtended) {
  const bytes = getZkLoginSignatureBytes({
    inputs,
    maxEpoch,
    userSignature,
    webAuthn, // option for webAuthn
  });
  const signatureBytes = new Uint8Array(bytes.length + 1);
  signatureBytes.set([SIGNATURE_SCHEME_TO_FLAG.ZkLogin]);
  signatureBytes.set(bytes, 1);
  return toB64(signatureBytes);
}
```

### Verification Transaction Sample

```typescript
// https://github.com/zktx-io/zklogin-webauthn-poc/blob/main/src/component/zkLogin/webAuthn/verify.ts

export const verify = async (
  tx: Uint8Array,
  signature: string | Uint8Array,
): Promise<void> => {
  const bytes = typeof signature === 'string' ? fromB64(signature) : signature;
  const txHash = sha256(tx);
  if (bytes[0] === 5) {
    const { webAuthn, userSignature } = parseZkLoginSignature(bytes.slice(1));
    if (webAuthn) {
      const clientDataHASH = sha256(Uint8Array.from(webAuthn.clientDataJSON));
      const clientData = JSON.parse(
        Buffer.from(webAuthn.clientDataJSON).toString(),
      );
      const signedData = new Uint8Array(
        webAuthn.authenticatorData.length + clientDataHASH.length,
      );
      signedData.set(webAuthn.authenticatorData);
      signedData.set(clientDataHASH, webAuthn.authenticatorData.length);

      const { publicKey, signature } = parseSerializedSignature(
        typeof userSignature === 'string'
          ? userSignature
          : toB64(userSignature),
      );

      if (publicKey && signature) {
        console.log(
          'challange',
          Buffer.from(clientData.challenge, 'base64').equals(
            Buffer.from(txHash),
          ),
        );
        console.log(
          'signature',
          secp256r1.verify(signature, sha256(signedData), publicKey),
        );
        const pubKey = new Secp256r1PublicKey(publicKey);
        console.log('signature', await pubKey.verify(signedData, signature));
      } else {
        console.log('fail');
      }
    }
  }
};
```

## Backwards Compatibility

There are no issues with backwards compatibility. The addition of WebAuthn support is an optional feature and will not affect existing functionalities.

## Test Cases

To be developed once the design and problem statement are fully reviewed and accepted.

## Reference Implementation

- [Github (Sign, Serialize, Verification)](https://github.com/zktx-io/zklogin-webauthn-poc)
- [PoC (Sign, Serialize, Verification)](https://zklogin.zktx.io/)

## Security Considerations

Introducing WebAuthn support enhances security by leveraging hardware-backed keys and secure authentication methods. It minimizes the risk of key compromise compared to traditional ephemeral key storage methods such as localStorage.

## Copyright

This document is placed in the public domain.
