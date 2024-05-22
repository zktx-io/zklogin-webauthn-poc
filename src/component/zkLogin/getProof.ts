import { getExtendedEphemeralPublicKey } from '@mysten/zklogin';
import { prover } from './config';
import { PublicKey } from '@mysten/sui.js/cryptography';

export const getProof = async (
  jwt: string,
  publicKey: PublicKey,
  maxEpoch: number,
  randomness: string,
  salt: string,
): Promise<string> => {
  const res = await fetch(prover, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jwt,
      extendedEphemeralPublicKey: getExtendedEphemeralPublicKey(publicKey),
      maxEpoch,
      jwtRandomness: randomness,
      salt: Buffer.from(salt.replace('0x', '')).toString('base64'),
      keyClaimName: 'sub',
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${data.message}`);
  }
  return JSON.stringify(data);
};
