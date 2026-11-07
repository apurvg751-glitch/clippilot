Option Explicit

Dim WshShell, fso, http, isRunning, count, maxWait, appDir, edgeExe, chromeExe

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = "C:\Users\admin\.gemini\antigravity\scratch\clippilot"
WshShell.CurrentDirectory = appDir

Function CheckServer()
    On Error Resume Next
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    http.open "GET", "http://localhost:3000/api/youtube/status", False
    http.setTimeouts 400, 400, 400, 400
    http.send
    If Err.Number = 0 Then
        CheckServer = (http.status = 200)
    Else
        CheckServer = False
    End If
    On Error Goto 0
End Function

isRunning = CheckServer()

' If server is not running, launch it completely silently in the background
If Not isRunning Then
    ' 0 = Hide window completely (no black cmd box)
    WshShell.Run "cmd /c ""C:\Program Files\nodejs\node.exe"" node_modules\next\dist\bin\next start -p 3000", 0, False
    
    count = 0
    maxWait = 35 ' max 7 seconds
    Do While count < maxWait And Not isRunning
        WScript.Sleep 200
        isRunning = CheckServer()
        count = count + 1
    Loop
End If

' Open directly in standalone native app window (no address bar, no browser tabs)
edgeExe = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"

If fso.FileExists(edgeExe) Then
    WshShell.Run """" & edgeExe & """ --app=http://localhost:3000 --app-id=ClipPilotStudio", 1, False
ElseIf fso.FileExists(chromeExe) Then
    WshShell.Run """" & chromeExe & """ --app=http://localhost:3000 --app-id=ClipPilotStudio", 1, False
Else
    WshShell.Run "msedge.exe --app=http://localhost:3000", 1, False
End If
