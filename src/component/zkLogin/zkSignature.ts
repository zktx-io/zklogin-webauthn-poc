import { decodeJwt } from 'jose';
import { genAddressSeed } from '@mysten/zklogin';
import { getZkLoginSignature } from './webAuthn/signature';

export const getZkSignature = (
  jwt: string,
  proof: string,
  salt: string,
  maxEpoch: number,
  userSignature: string | Uint8Array,
  webAuthn?: {
    authenticatorData: string;
    clientDataJSON: string;
  },
): string => {
  const decodedJwt = decodeJwt(jwt);
  const addressSeed =
    decodedJwt &&
    decodedJwt.sub &&
    decodedJwt.aud &&
    genAddressSeed(
      BigInt(salt),
      'sub',
      decodedJwt.sub,
      decodedJwt.aud as string,
    ).toString();
  return getZkLoginSignature({
    inputs: {
      ...JSON.parse(proof),
      addressSeed,
    },
    maxEpoch,
    userSignature,
    webAuthn,
  });
};
