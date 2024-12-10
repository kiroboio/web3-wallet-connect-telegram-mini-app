import { ChainId, getUserTokens } from '@/app/utils/alchemy';
import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
// import { getUserTokens, TokenInfo } from '@/utils/alchemy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('address');
  const chainId = searchParams.get('chainId') as ChainId;
  
  if (!userAddress || !ethers.utils.isAddress(userAddress)) {
    return NextResponse.json({ error: 'Invalid or missing address parameter.' }, { status: 400 });
  }

  try {
    const tokens = await getUserTokens(userAddress, chainId);
    return NextResponse.json({ tokens }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens.' }, { status: 500 });
  }
}