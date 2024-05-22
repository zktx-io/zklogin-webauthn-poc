import { fromB64, toB64 } from '@mysten/bcs';
import { SIGNATURE_SCHEME_TO_FLAG } from '@mysten/sui.js/cryptography';
import { Secp256r1PublicKey } from '@mysten/sui.js/keypairs/secp256r1';
import { sha256 } from '@noble/hashes/sha256';
import { secp256r1 } from '@noble/curves/p256';

export const webAuthnGet = async (
  rpId: string,
  webAuthn: {
    credentialId: string;
    publicKey: string;
  },
  unsignedTx: string,
): Promise<{
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
}> => {
  const challenge = sha256(fromB64(unsignedTx));
  const credential: {
    response: {
      authenticatorData: ArrayBuffer;
      clientDataJSON: ArrayBuffer;
      signature: ArrayBuffer;
    };
  } = (await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId,
      userVerification: 'preferred',
      allowCredentials: [
        {
          type: 'public-key',
          id: fromB64(
            webAuthn.credentialId
              .replace(/-/g, '+')
              .replace(/_/g, '/')
              .replace(/\s/g, ''),
          ),
        },
      ],
    },
  })) as any;

  const publicKey = new Secp256r1PublicKey(webAuthn.publicKey).toRawBytes();
  const signature = secp256r1.Signature.fromDER(
    new Uint8Array(credential.response.signature),
  ).toCompactRawBytes();
  const userSignature = new Uint8Array(1 + signature.length + publicKey.length);
  userSignature.set([SIGNATURE_SCHEME_TO_FLAG.Secp256r1]); // alg: -7
  userSignature.set(signature, 1);
  userSignature.set(publicKey, 1 + signature.length);

  return {
    authenticatorData: toB64(
      new Uint8Array(credential.response.authenticatorData),
    ),
    clientDataJSON: toB64(new Uint8Array(credential.response.clientDataJSON)),
    signature: toB64(userSignature),
  };
};
