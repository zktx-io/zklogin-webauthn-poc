import { fromB64, toB64 } from '@mysten/bcs';
import { parseSerializedSignature } from '@mysten/sui.js/cryptography';
import { sha256 } from '@noble/hashes/sha256';
import { Secp256r1PublicKey } from '@mysten/sui.js/keypairs/secp256r1';
import { secp256r1 } from '@noble/curves/p256';
import { parseZkLoginSignature } from './signature';

export const verify = async (
  tx: Uint8Array,
  signature: string | Uint8Array,
): Promise<void> => {
  const bytes = typeof signature === 'string' ? fromB64(signature) : signature;
  const txHash = sha256(tx);
  if (bytes[0] === 5) {
    const { webAuthn, userSignature } = parseZkLoginSignature(bytes.slice(1));
    if (webAuthn) {
      const clientDataHASH = sha256(Uint8Array.from(webAuthn.clientDataJSON));
      const clientData = JSON.parse(
        Buffer.from(webAuthn.clientDataJSON).toString(),
      );
      const signedData = new Uint8Array(
        webAuthn.authenticatorData.length + clientDataHASH.length,
      );
      signedData.set(webAuthn.authenticatorData);
      signedData.set(clientDataHASH, webAuthn.authenticatorData.length);

      const { publicKey, signature } = parseSerializedSignature(
        typeof userSignature === 'string'
          ? userSignature
          : toB64(userSignature),
      );

      if (publicKey && signature) {
        console.log(
          'challange',
          Buffer.from(clientData.challenge, 'base64').equals(
            Buffer.from(txHash),
          ),
        );
        console.log(
          'signature',
          secp256r1.verify(signature, sha256(signedData), publicKey),
        );
        const pubKey = new Secp256r1PublicKey(publicKey);
        console.log('signature', await pubKey.verify(signedData, signature));
      } else {
        console.log('fail');
      }
    }
  }
};
