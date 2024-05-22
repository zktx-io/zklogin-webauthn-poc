import { useEffect, useRef } from 'react';
import { Secp256r1PublicKey } from '@mysten/sui.js/keypairs/secp256r1';
import { fromB64 } from '@mysten/bcs';
import { SIGNATURE_SCHEME_TO_FLAG } from '@mysten/sui.js/cryptography';
import { getAccountData, getWebAuthnData } from '../component/localStorage';
import { useNavigate } from 'react-router-dom';
import { webAuthnGet } from '../component/webAuthn/webAuthnGet';
import { getZkSignature } from '../component/zkLogin/zkSignature';
import { verify } from '../component/zkLogin/webAuthn/verify';

export const Home = () => {
  const initialized = useRef<boolean>(false);
  const navigate = useNavigate();

  const handleSignAndVerification = async () => {
    const webAuthnData = getWebAuthnData();
    const account = getAccountData();
    if (!!webAuthnData && !!account) {
      // TEST
      const unsignedTx = Buffer.from(new Uint8Array(90).fill(2)).toString(
        'base64',
      );
      // TEST
      const { authenticatorData, clientDataJSON, signature } =
        await webAuthnGet('localhost', webAuthnData.credentialId, unsignedTx);
      if (webAuthnData.alg === -7) {
        const publicKey = new Secp256r1PublicKey(
          webAuthnData.publicKey,
        ).toRawBytes();
        const temp = fromB64(signature);
        const userSignature = new Uint8Array(
          1 + temp.length + publicKey.length,
        );
        userSignature.set([SIGNATURE_SCHEME_TO_FLAG.Secp256r1]); // alg: -7
        userSignature.set(temp, 1);
        userSignature.set(publicKey, 1 + temp.length);

        const zkSig = getZkSignature(
          account.jwt,
          account.proof,
          account.salt,
          account.maxEpoch,
          userSignature,
          {
            authenticatorData,
            clientDataJSON,
          },
        );
        verify(Buffer.from(unsignedTx, 'base64'), zkSig);
      }
    }
  };

  useEffect(() => {
    const init = () => {
      initialized.current = true;
      if (!getAccountData()) {
        navigate('/sign-up');
      }
    };
    !initialized.current && init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <img src={'/logo.png'} className="App-logo" alt="logo" />
      <h1>zkLogin WebAuthn POC</h1>
      <button onClick={handleSignAndVerification}>sign and verification</button>
      <h2>Home</h2>
    </>
  );
};
