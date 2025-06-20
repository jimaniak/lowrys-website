// API route for Rate Calculator data
import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'major-groups':
        const majorGroups = await dbHelpers.getMajorGroupsForRateCalculator();
        return NextResponse.json(majorGroups);

      case 'occupations':
        const majorGroupCode = searchParams.get('majorGroup') || 'ALL';
        const occupations = await dbHelpers.getOccupationsForRateCalculator(majorGroupCode);
        return NextResponse.json(occupations);

      case 'regions':
        const occupationCode = searchParams.get('occupationCode');
        if (!occupationCode) {
          return NextResponse.json({ error: 'occupationCode is required' }, { status: 400 });
        }
        const regions = await dbHelpers.getRegionsForOccupation(occupationCode);
        return NextResponse.json(regions);

      case 'benchmark':
        const occCode = searchParams.get('occupationCode');
        const region = searchParams.get('region') || 'US';
        if (!occCode) {
          return NextResponse.json({ error: 'occupationCode is required' }, { status: 400 });
        }
        const benchmark = await dbHelpers.getBenchmarkData(occCode, region);
        return NextResponse.json(benchmark);      case 'occupation-data':
        const occDataCode = searchParams.get('occupationCode');
        const occDataRegion = searchParams.get('region') || undefined;
        if (!occDataCode) {
          return NextResponse.json({ error: 'occupationCode is required' }, { status: 400 });
        }
        const data = await dbHelpers.getOccupationData(occDataCode, occDataRegion);
        return NextResponse.json(data);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Rate Calculator API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
