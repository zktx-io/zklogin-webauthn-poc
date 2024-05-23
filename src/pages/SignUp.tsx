import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAccountData,
  getWebAuthnData,
  setNonceData,
  setWebAuthnData,
} from '../component/localStorage';
import { getProviderUrl } from '../component/zkLogin/getProviderUrl';
import { webAuthnCreate } from '../component/webAuthn/webAuthnCreate';

export const SignUp = () => {
  const initialized = useRef<boolean>(false);
  const navigate = useNavigate();

  const handleRegistration = async () => {
    let data = getWebAuthnData();
    if (!data) {
      const { credentialId, alg, publicKey } = await webAuthnCreate();
      setWebAuthnData({ credentialId, alg, publicKey });
      data = { credentialId, alg, publicKey };
    }
    const { url, maxEpoch, randomness } = await getProviderUrl(data.publicKey);
    setNonceData({ maxEpoch, randomness });
    window.location.replace(url);
  };

  useEffect(() => {
    const init = () => {
      initialized.current = true;
      if (getAccountData()) {
        navigate('/');
      }
    };
    !initialized.current && init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <img src={'/logo.png'} className="App-logo" alt="logo" />
      <h1>zkLogin + WebAuthn PoC</h1>
      <button onClick={handleRegistration}>registration</button>
      <h2>Sign Up</h2>
    </>
  );
};
