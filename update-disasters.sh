#!/bin/bash
# Bash script to update disasters.csv from EM-DAT or another source
CSV_URL="https://public.emdat.be/download/Disaster_Year.csv"  # Example placeholder, update as needed
DEST="public/data/disasters.csv"
echo "Downloading latest disaster data from $CSV_URL ..."
curl -L "$CSV_URL" -o "$DEST"
echo "Disaster data updated at $DEST"
