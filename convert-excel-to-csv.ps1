param(
    [string]$excelFilePath,
    [string]$sheetName,
    [string]$csvFilePath
)

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false

# Open the workbook
$workbook = $excel.Workbooks.Open($excelFilePath)

# List all sheet names
Write-Output "Available sheets:"
$workbook.Sheets | ForEach-Object { Write-Output $_.Name }

# Select the sheet
$sheet = $workbook.Sheets.Item($sheetName)

# Save as CSV
$sheet.SaveAs($csvFilePath, 6) # 6 corresponds to xlCSV

# Clean up COM objects
$workbook.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
