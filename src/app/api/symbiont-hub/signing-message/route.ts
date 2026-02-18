import { NextRequest, NextResponse } from 'next/server';
import { getSigningMessage, CONSTITUTION_VERSION, CONSTITUTION_HASH } from '@/lib/symbiont';

// GET /api/symbiont-hub/signing-message - Get the message to sign
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const wallet = searchParams.get('wallet');

  if (!name || !wallet) {
    return NextResponse.json({
      error: 'Provide ?name=... and ?wallet=... query params',
      example: '/api/symbiont-hub/signing-message?name=my-agent&wallet=0x...'
    }, { status: 400 });
  }

  const message = getSigningMessage(name, wallet);

  return NextResponse.json({
    message,
    constitution_version: CONSTITUTION_VERSION,
    constitution_hash: CONSTITUTION_HASH,
    instructions: 'Sign this message with your wallet to register'
  });
}
