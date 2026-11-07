$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "ClipPilot.lnk"
$TargetPath = "C:\Users\admin\.gemini\antigravity\scratch\clippilot\Launch-ClipPilot.bat"
$WorkingDir = "C:\Users\admin\.gemini\antigravity\scratch\clippilot"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $WorkingDir
$Shortcut.Description = "ClipPilot Creator Studio"
$Shortcut.Save()

Write-Host "Created ClipPilot shortcut at: $ShortcutPath"
