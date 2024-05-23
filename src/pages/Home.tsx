import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fromB64, toB64 } from '@mysten/bcs';
import { getAccountData, getWebAuthnData } from '../component/localStorage';
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
      const unsignedTx = toB64(new Uint8Array(90).fill(2));
      // TEST
      const { authenticatorData, clientDataJSON, signature } =
        await webAuthnGet(webAuthnData, unsignedTx);
      if (webAuthnData.alg === -7) {
        const zkSig = getZkSignature(
          account.jwt,
          account.proof,
          account.salt,
          account.maxEpoch,
          signature,
          {
            authenticatorData,
            clientDataJSON,
          },
        );
        verify(fromB64(unsignedTx), zkSig);
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
      <h1>zkLogin + WebAuthn PoC</h1>
      <button onClick={handleSignAndVerification}>sign and verification</button>
      <h2>Home</h2>
    </>
  );
};
