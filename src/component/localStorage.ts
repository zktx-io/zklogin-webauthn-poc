export const getWebAuthnData = (): null | {
  credentialId: string;
  alg: number;
  publicKey: string;
} => {
  const data = localStorage.getItem('webAuthn');
  return !data ? data : JSON.parse(data);
};

export const setWebAuthnData = (data: {
  credentialId: string;
  alg: number;
  publicKey: string;
}) => {
  localStorage.setItem('webAuthn', JSON.stringify(data));
};

export const getNonceData = (): null | {
  maxEpoch: number;
  randomness: string;
} => {
  const data = localStorage.getItem('nonce');
  return !data ? data : JSON.parse(data);
};

export const setNonceData = (data: {
  maxEpoch: number;
  randomness: string;
}) => {
  localStorage.setItem('nonce', JSON.stringify(data));
};

export const getAccountData = (): null | {
  maxEpoch: number;
  jwt: string;
  proof: string;
  salt: string;
  address: string;
} => {
  const data = localStorage.getItem('account');
  return !data ? data : JSON.parse(data);
};

export const setAccountData = (data: {
  maxEpoch: number;
  jwt: string;
  proof: string;
  salt: string;
  address: string;
}) => {
  localStorage.removeItem('nonce');
  localStorage.setItem('account', JSON.stringify(data));
};

export const signOut = () => {
  localStorage.clear();
};
