@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-17
echo Setting JAVA_HOME to: %JAVA_HOME%
echo.
echo Compiling the application...
.\mvnw.cmd clean package -DskipTests
echo.
echo Compilation complete!
pause
