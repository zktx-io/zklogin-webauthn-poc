import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { Secp256r1PublicKey } from '@mysten/sui.js/keypairs/secp256r1';

import { ClientId, Redirect, Rpc } from './config';

export const getProviderUrl = async (
  publicKey: string,
): Promise<{
  url: string;
  randomness: string;
  maxEpoch: number;
}> => {
  const ephemeralPublicKey = new Secp256r1PublicKey(
    Buffer.from(publicKey, 'base64'),
  );

  const res = await fetch(Rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'suix_getLatestSuiSystemState',
      params: [],
    }),
  });

  const { result } = await res.json();
  const maxEpoch = Number(result.epoch) + 10;
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralPublicKey, maxEpoch, randomness);
  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${ClientId}&redirect_uri=${Redirect}&response_type=id_token&nonce=${nonce}&scope=openid`,
    randomness,
    maxEpoch,
  };
};
