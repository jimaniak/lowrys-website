# Owner Automation Quick Reference

**For: Jim Lowry (private use only)**

## Disaster Data Automation Scripts

### PowerShell Script
- **File:** `update-disasters.ps1`
- **Usage:**
  ```powershell
  .\update-disasters.ps1
  ```
- **Description:** Downloads the latest disaster CSV and updates `public/data/disasters.csv`.

### Bash Script
- **File:** `update-disasters.sh`
- **Usage (in PowerShell with Git Bash):**
  ```powershell
  bash update-disasters.sh
  ```
- **Usage (in Git Bash terminal):**
  ```bash
  ./update-disasters.sh
  ```
- **Description:** Downloads the latest disaster CSV and updates `public/data/disasters.csv`.

### Update the Download URL
- Both scripts use a placeholder EM-DAT CSV URL.
- Update the `CSV_URL` (Bash) or `$csvUrl` (PowerShell) variable to your preferred dataset link if needed.

### Scheduling (Optional)
- **PowerShell:** Use Windows Task Scheduler to run:
  ```powershell
  powershell.exe -File "C:\path\to\update-disasters.ps1"
  ```
- **Bash:** Use Task Scheduler to run:
  ```powershell
  bash "C:\path\to\update-disasters.sh"
  ```
  (Requires Git Bash or WSL installed)

### After Running
- The analytics demo at `/demo` will automatically use the latest data from `public/data/disasters.csv`.

---

**For further automation, notifications, or help, see Copilot or your site admin notes.**
