import { JsonRpcProvider } from '@ethersproject/providers';
import { RPCs } from './RPCs';

export const providerMainnet = new JsonRpcProvider(RPCs['1']);
const providerArbitrum = new JsonRpcProvider(RPCs['42161']);
const providerSepolia = new JsonRpcProvider(RPCs['11155111']);
const providerOptimism = new JsonRpcProvider(RPCs['10']);
const proivderBase = new JsonRpcProvider(RPCs['8453']);

const provider = {
  '1': providerMainnet,
  '10': providerOptimism,
  '42161': providerArbitrum,
  '8453': proivderBase,
  '11155111': providerSepolia,
};

export type ChainId = keyof typeof provider
export const getProvider = (chainId: ChainId) => provider[chainId]