$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "ClipPilot.lnk"

$VbsPath = "C:\Users\admin\.gemini\antigravity\scratch\clippilot\Launch-ClipPilot.vbs"
$WorkingDir = "C:\Users\admin\.gemini\antigravity\scratch\clippilot"
$IconPath = "C:\Users\admin\.gemini\antigravity\scratch\clippilot\public\clippilot.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = $WorkingDir
$Shortcut.IconLocation = "$IconPath, 0"
$Shortcut.Description = "ClipPilot Creator Studio"
$Shortcut.WindowStyle = 1
$Shortcut.Save()

Write-Host "Success! Configured native desktop shortcut: $ShortcutPath"
