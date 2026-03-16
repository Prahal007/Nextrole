@REM
@REM Maven Wrapper Script for Windows
@REM This script will download and use Maven Wrapper

set MAVEN_PROJECT_BASEDIR=%~dp0
if exist "%MAVEN_PROJECT_BASEDIR%" goto :projectBaseDirSet

set MAVEN_PROJECT_BASEDIR=%~dp0
:projectBaseDirSet

set MAVEN_OPTS=-Xmx1024m
set WRAPPER_JAR="%MAVEN_PROJECT_BASEDIR%\.m2\wrapper\maven-wrapper.jar"

if exist "%WRAPPER_JAR%" (
    echo "Using Maven Wrapper at %WRAPPER_JAR%"
    "%JAVA_HOME%\bin\java" %MAVEN_OPTS% -jar "%WRAPPER_JAR%" %*
) else (
    echo "Maven Wrapper not found. Downloading..."
    if not exist "%MAVEN_PROJECT_BASEDIR%\.m2" (
        mkdir "%MAVEN_PROJECT_BASEDIR%\.m2"
    )
    
    echo Downloading Maven Wrapper...
    powershell -Command "& { [Net.ServicePointManager]::FindSystemServiceById('System.Net.HttpClient').DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper-3.2.0.jar', '%MAVEN_PROJECT_BASEDIR%\.m2\wrapper\maven-wrapper.jar') }"
    
    if exist "%WRAPPER_JAR%" (
        echo "Maven Wrapper downloaded successfully"
    )
)
