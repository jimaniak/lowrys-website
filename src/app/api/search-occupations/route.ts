import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/database';

interface OccupationRow {
  name: string;
  category: string | null;
  code: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ occupations: [] });
    }

    // Search occupations table for industry-level categories only (exclude individual occupations)
    const result = await db.execute({
      sql: `
        SELECT DISTINCT 
          name,
          category,
          code
        FROM occupations 
        WHERE (name LIKE ? OR category LIKE ?) 
          AND name IS NOT NULL 
          AND name != ''
          AND category IN ('MAJOR', 'MINOR', 'BROAD', 'DETAILED')
        ORDER BY 
          CASE 
            WHEN category = 'MAJOR' THEN 1
            WHEN category = 'MINOR' THEN 2 
            WHEN category = 'BROAD' THEN 2
            WHEN category = 'DETAILED' THEN 3
            ELSE 4
          END,
          CASE 
            WHEN name LIKE ? THEN 1 
            WHEN category LIKE ? THEN 2 
            ELSE 3 
          END,
          LENGTH(name),
          name
        LIMIT 15
      `,
      args: [
        `%${query}%`, 
        `%${query}%`,
        `${query}%`,  // Exact match at start gets priority
        `${query}%`   // Category match at start gets priority
      ]
    });

    const occupations = result.rows.map((row: any) => ({
      name: row.name,
      category: row.category,
      code: row.code,
      // Create a URL-friendly slug
      slug: row.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));

    return NextResponse.json({ occupations });
  } catch (error) {
    console.error('Error searching occupations:', error);
    return NextResponse.json(
      { error: 'Failed to search occupations' },
      { status: 500 }
    );
  }
}
