import { InferBcsInput, bcs } from '@mysten/bcs';

export const zkLoginSignature = (bcs as any).struct('ZkLoginSignature', {
  inputs: (bcs as any).struct('ZkLoginSignatureInputs', {
    proofPoints: (bcs as any).struct('ZkLoginSignatureInputsProofPoints', {
      a: bcs.vector(bcs.string()),
      b: bcs.vector(bcs.vector(bcs.string())),
      c: bcs.vector(bcs.string()),
    }),
    issBase64Details: (bcs as any).struct('ZkLoginSignatureInputsClaim', {
      value: bcs.string(),
      indexMod4: bcs.u8(),
    }),
    headerBase64: bcs.string(),
    addressSeed: bcs.string(),
  }),
  maxEpoch: bcs.u64(),
  userSignature: bcs.vector(bcs.u8()),

  // option for webAuthn
  webAuthn: bcs.option(
    (bcs as any).struct('ZkLoginWebAuthn', {
      clientDataJSON: bcs.vector(bcs.u8()),
      authenticatorData: bcs.vector(bcs.u8()),
    }),
  ),
  // option for webAuthn
});

export type ZkLoginSignature = InferBcsInput<typeof zkLoginSignature>;
