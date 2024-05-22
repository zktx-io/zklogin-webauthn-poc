import { fromB64, toB64 } from '@mysten/bcs';
import { parseSerializedSignature } from '@mysten/sui.js/cryptography';
import { Secp256r1PublicKey } from '@mysten/sui.js/dist/cjs/keypairs/secp256r1';
import { sha256 } from '@noble/hashes/sha256';

export const verify = (
  tx: Uint8Array,
  signature: string | Uint8Array,
  webAuthn: {
    clientData: string | Uint8Array;
    authenticatorData: string | Uint8Array;
  },
): boolean => {
  const parsedSignature = parseSerializedSignature(
    typeof signature === 'string' ? signature : toB64(signature),
  );

  if (parsedSignature.signatureScheme === 'Secp256r1') {
    const txHash = sha256(tx);
    const authenticatorData =
      typeof webAuthn.authenticatorData === 'string'
        ? fromB64(webAuthn.authenticatorData)
        : webAuthn.authenticatorData;
    const clientDataHASH = sha256(
      typeof webAuthn.clientData === 'string'
        ? fromB64(webAuthn.clientData)
        : webAuthn.clientData,
    );
    const clientData = JSON.parse(
      Buffer.from(
        typeof webAuthn.clientData === 'string'
          ? fromB64(webAuthn.clientData)
          : webAuthn.clientData,
      ).toString(),
    );

    const pubKey = new Secp256r1PublicKey(parsedSignature.publicKey);
    const message = new Uint8Array(
      authenticatorData.length + clientDataHASH.length,
    );
    message.set(authenticatorData);
    message.set(clientDataHASH, authenticatorData.length);

    console.log(
      Buffer.from(clientData.challange, 'base64').equals(Buffer.from(txHash)),
    );
    console.log(pubKey.verify(message, parsedSignature.signature));
  }
  return false;
};
