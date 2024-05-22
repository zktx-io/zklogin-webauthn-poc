import { toB64 } from '@mysten/sui.js/utils';
import keyutil from 'js-crypto-key-utils';

export const webAuthnCreate = async (
  rpId: string,
): Promise<{ credentialId: string; alg: number; publicKey: string }> => {
  const alg = -7; // Secp256r1
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        id: rpId,
        name: rpId,
      },
      user: {
        id: new Uint8Array(32).fill(1),
        name: 'WebAuthn PoC',
        displayName: 'WebAuthn PoC',
      },
      pubKeyCredParams: [{ type: 'public-key', alg }],
      timeout: 60000,
      excludeCredentials: [],
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        userVerification: 'preferred',
      },
    },
  });
  if (credential) {
    const keyObjFromJwk = new keyutil.Key(
      'der',
      new Uint8Array((credential as any).response.getPublicKey()),
    );
    const publicKey = (await keyObjFromJwk.export('oct', {
      outputPublic: true,
      compact: true,
    })) as Uint8Array;
    return {
      publicKey: toB64(publicKey),
      alg,
      credentialId: credential.id,
    };
  }
  throw new Error('credential create error');
};
