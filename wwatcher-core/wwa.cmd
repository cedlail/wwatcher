@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\cli" %*
) ELSE (
  node "%~dp0\lib\cli" %*
)
