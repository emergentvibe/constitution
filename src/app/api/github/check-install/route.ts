import { NextRequest, NextResponse } from 'next/server';
import { checkInstallation, parseRepoFullName } from '@/lib/github';

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get('repo');
  if (!repo) {
    return NextResponse.json(
      { error: 'repo query param required (owner/repo or GitHub URL)' },
      { status: 400 }
    );
  }

  const parsed = parseRepoFullName(repo);
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid repo format. Use owner/repo or a GitHub URL.' },
      { status: 400 }
    );
  }

  const result = await checkInstallation(parsed.owner, parsed.repo);
  return NextResponse.json(result);
}
