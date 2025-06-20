@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
echo Building JAR package...
.\mvnw.cmd package -Dmaven.test.skip=true
echo Done!
