import { fromB64, toB64 } from '@mysten/bcs';
import { sha256 } from '@noble/hashes/sha256';

export const webAuthnGet = async (
  rpId: string,
  credentialId: string,
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
            credentialId
              .replace(/-/g, '+')
              .replace(/_/g, '/')
              .replace(/\s/g, ''),
          ),
        },
      ],
    },
  })) as any;

  return {
    authenticatorData: toB64(
      new Uint8Array(credential.response.authenticatorData),
    ),
    clientDataJSON: toB64(new Uint8Array(credential.response.clientDataJSON)),
    signature: toB64(new Uint8Array(credential.response.signature)),
  };
};
