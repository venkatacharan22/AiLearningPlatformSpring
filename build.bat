@echo off
setlocal

REM Set JAVA_HOME explicitly
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
echo Setting JAVA_HOME to: %JAVA_HOME%

REM Verify Java is available
"%JAVA_HOME%\bin\java" -version
if errorlevel 1 (
    echo ERROR: Java not found at %JAVA_HOME%
    pause
    exit /b 1
)

echo.
echo Building the application (skipping tests)...

REM Try to build without tests
powershell -Command "$env:JAVA_HOME='C:\Program Files\Java\jdk-17'; & '.\mvnw.cmd' clean compile '-Dmaven.test.skip=true'"

if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Creating JAR file...
powershell -Command "$env:JAVA_HOME='C:\Program Files\Java\jdk-17'; & '.\mvnw.cmd' spring-boot:repackage '-Dmaven.test.skip=true'"

if errorlevel 1 (
    echo ERROR: JAR creation failed
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo JAR file: target\ai-learning-platform-0.0.1-SNAPSHOT.jar
pause
