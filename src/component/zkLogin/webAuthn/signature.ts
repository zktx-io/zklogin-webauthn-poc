import { fromBase64, toBase64 } from '@mysten/bcs';
import { SIGNATURE_SCHEME_TO_FLAG } from '@mysten/sui/cryptography';
import { zkLoginSignature } from './bcs';

// https://github.com/MystenLabs/sui/blob/main/sdk/typescript/src/zklogin/signature.ts
interface ZkLoginSignatureExtended {
  inputs: any;
  maxEpoch: any;
  userSignature: string | Uint8Array;
  // option for webAuthn
  webAuthn?: {
    clientDataJSON: string | Uint8Array;
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
            ? fromBase64(userSignature)
            : userSignature,

        // option for webAuthn
        webAuthn: !webAuthn
          ? webAuthn
          : {
              clientDataJSON:
                typeof webAuthn.clientDataJSON === 'string'
                  ? fromBase64(webAuthn.clientDataJSON)
                  : webAuthn.clientDataJSON,
              authenticatorData:
                typeof webAuthn.authenticatorData === 'string'
                  ? fromBase64(webAuthn.authenticatorData)
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
  return toBase64(signatureBytes);
}

export function parseZkLoginSignature(signature: string | Uint8Array) {
  return zkLoginSignature.parse(
    typeof signature === 'string' ? fromBase64(signature) : signature,
  );
}
