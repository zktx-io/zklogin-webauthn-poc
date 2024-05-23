import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { Secp256r1PublicKey } from '@mysten/sui.js/keypairs/secp256r1';

import { Rpc } from './config';
import { fromB64 } from '@mysten/bcs';

export const getProviderUrl = async (
  publicKey: string,
): Promise<{
  url: string;
  randomness: string;
  maxEpoch: number;
}> => {
  const ephemeralPublicKey = new Secp256r1PublicKey(fromB64(publicKey));

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
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const redirect = process.env.REACT_APP_REDIRECT;

  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=id_token&nonce=${nonce}&scope=openid`,
    randomness,
    maxEpoch,
  };
};
