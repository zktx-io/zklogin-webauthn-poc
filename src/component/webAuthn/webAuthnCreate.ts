import { toB64, toHEX } from '@mysten/sui.js/utils';
import { secp256r1 } from '@noble/curves/p256';

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
    const key = await window.crypto.subtle.importKey(
      'spki',
      (credential as any).response.getPublicKey(),
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify'],
    );
    const compressedPubkey = secp256r1.ProjectivePoint.fromHex(
      toHEX(new Uint8Array(await window.crypto.subtle.exportKey('raw', key))),
    ).toRawBytes(true);
    return {
      publicKey: toB64(compressedPubkey),
      alg,
      credentialId: credential.id,
    };
  }
  throw new Error('credential create error');
};
