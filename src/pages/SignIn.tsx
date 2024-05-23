import queryString from 'query-string';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fromB64 } from '@mysten/bcs';
import { Secp256r1PublicKey } from '@mysten/sui.js/keypairs/secp256r1';
import { jwtToAddress } from '@mysten/zklogin';
import {
  getAccountData,
  getNonceData,
  getWebAuthnData,
  setAccountData,
} from '../component/localStorage';
import { getProof } from '../component/zkLogin/getProof';

export const SignIn = () => {
  const initialized = useRef<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      initialized.current = true;
      const { id_token: jwt } = queryString.parse(location.hash) as {
        id_token: string;
      };
      if (!jwt) {
        alert('error');
        navigate('/sign-up');
        return;
      }

      const webAuthn = getWebAuthnData();
      const nonce = getNonceData();
      if (!!nonce && !!webAuthn) {
        const ephemeralPublicKey = new Secp256r1PublicKey(
          fromB64(webAuthn.publicKey),
        );

        const salt = '1'; // temp
        const proof = await getProof(
          jwt,
          ephemeralPublicKey,
          nonce.maxEpoch,
          nonce.randomness,
          salt,
        );
        const address = jwtToAddress(jwt, BigInt(salt));
        setAccountData({ maxEpoch: nonce.maxEpoch, jwt, proof, salt, address });
        navigate('/');
      } else {
        alert('error');
        navigate('/sign-up');
      }
    };
    !initialized.current && init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (getAccountData()) {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <img src={'/logo.png'} className="App-logo" alt="logo" />
      <h1>zkLogin + WebAuthn PoC</h1>
      <h2>Sign In</h2>
    </>
  );
};
