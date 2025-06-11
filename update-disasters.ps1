# PowerShell script to update disasters.csv from EM-DAT or another source
# Update the URL below to the direct CSV download link you want
$csvUrl = "https://public.emdat.be/download/Disaster_Year.csv"  # Example placeholder, update as needed
$destination = "public/data/disasters.csv"

Write-Host "Downloading latest disaster data from $csvUrl ..."
Invoke-WebRequest -Uri $csvUrl -OutFile $destination
Write-Host "Disaster data updated at $destination"
