#!/bin/bash
# Print a summary of occupation categories in the database
# Usage: ./print-category-summary.sh

# You must have sqlite3 installed and the database file path set
DB_PATH="/path/to/your/database.sqlite" # <-- Update this path

echo "Category counts:"
sqlite3 "$DB_PATH" "SELECT category, COUNT(*) as count FROM occupations GROUP BY category;"

echo "\nSample DETAILED records:"
sqlite3 "$DB_PATH" "SELECT occ_code, occ_title, occupation_type, category FROM occupations WHERE category = 'DETAILED' LIMIT 5;"

echo "\nSample OCCUPATION records:"
sqlite3 "$DB_PATH" "SELECT occ_code, occ_title, occupation_type, category FROM occupations WHERE category = 'OCCUPATION' LIMIT 5;"
