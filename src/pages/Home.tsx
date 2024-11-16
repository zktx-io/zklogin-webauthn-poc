import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fromBase64, toBase64 } from '@mysten/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import {
  getAccountData,
  getWebAuthnData,
  signOut,
} from '../component/localStorage';
import { webAuthnGet } from '../component/webAuthn/webAuthnGet';
import { getZkSignature } from '../component/zkLogin/zkSignature';
import { verify } from '../component/zkLogin/webAuthn/verify';

export const Home = () => {
  const initialized = useRef<boolean>(false);
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>('n/a');
  const [balance, setBalance] = useState<string>('n/a');

  const handleSignAndVerification = async () => {
    const webAuthnData = getWebAuthnData();
    const account = getAccountData();
    if (!!webAuthnData && !!account) {
      // TEST
      const unsignedTx = toBase64(new Uint8Array(90).fill(2));
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
        verify(fromBase64(unsignedTx), zkSig);
      }
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/sign-up');
  };

  useEffect(() => {
    const init = async () => {
      initialized.current = true;
      const account = getAccountData();
      if (!account) {
        navigate('/sign-up');
      } else {
        setAddress(account.address);
        const client = new SuiClient({ url: getFullnodeUrl('devnet') });
        const temp = await client.getBalance({
          owner: account.address,
        });
        setBalance(temp.totalBalance);
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
      <button onClick={handleSignOut}>sign out</button>
      <h2>Home</h2>
      <div>
        <p style={{ marginBottom: '0px', fontSize: '24px' }}>Address</p>
        <p style={{ marginTop: '0px', fontSize: '16px' }}>{address}</p>
        <p style={{ marginBottom: '0px', fontSize: '24px' }}>Balance</p>
        <p style={{ marginTop: '0px', fontSize: '16px' }}>{balance}</p>
      </div>
    </>
  );
};
