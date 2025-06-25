// API route to get BLS major groups for industry selection
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function GET() {
  try {
    // Get major groups that are relevant for business SEO
    const result = await db.execute(`
      SELECT code, name 
      FROM major_groups 
      WHERE code != '00-0000' 
      ORDER BY name
    `);
    
    // Filter to business-relevant categories and clean up names
    const businessRelevantGroups = result.rows
      .filter(group => {
        if (!group.name || typeof group.name !== 'string') return false;
        const name = group.name.toLowerCase();
        return !name.includes('military') && 
               !name.includes('farming') && 
               !name.includes('fishing') &&
               !name.includes('forestry');
      })
      .map(group => ({
        code: group.code,
        name: typeof group.name === 'string' ? group.name.replace(' Occupations', '') : '', // Clean up names
        slug: typeof group.name === 'string' 
          ? group.name
              .replace(' Occupations', '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
          : ''
          .replace(/^-|-$/g, '')
      }));

    return NextResponse.json(businessRelevantGroups);
  } catch (error) {
    console.error('Error fetching industry groups:', error);
    return NextResponse.json({ error: 'Failed to fetch industry groups' }, { status: 500 });
  }
}
