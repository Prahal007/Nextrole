#!/bin/sh

echo "=== PDFZen Application Startup ==="
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "Available Memory: $(free -m)"
echo "Current Directory: $(pwd)"
echo "Files in app directory: $(ls -la /app/)"

# Check if JAR file exists
if [ ! -f "/app/app.jar" ]; then
    echo "ERROR: app.jar not found in /app/"
    echo "Available files:"
    find /app -name "*.jar" -type f
    exit 1
fi

echo "Found JAR file: $(ls -la /app/app.jar)"

# Test JAR file integrity
echo "Testing JAR file integrity..."
if [ ! -s "/app/app.jar" ]; then
    echo "JAR file is empty"
    exit 1
fi

# Start application with comprehensive logging
echo "=== Starting Spring Boot Application ==="
echo "Command: java $JAVA_OPTS -Djava.awt.headless=true -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar app.jar --debug"

# Start in background with detailed logging
java $JAVA_OPTS -Djava.awt.headless=true -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -jar app.jar --debug > /tmp/startup.log 2>&1 &
JAVA_PID=$!

echo "Java process started with PID: $JAVA_PID"

# Wait for application to start
echo "Waiting for Spring Boot to initialize..."
sleep 20

# Check if Java process is still running
if kill -0 $JAVA_PID 2>/dev/null; then
    echo "=== Java Process Status ==="
    echo "Java process is running (PID: $JAVA_PID)"
    
    # Test if application is responding
    echo "Testing application health endpoint..."
    sleep 5
    
    # Check if port 8080 is listening
    if netstat -tlnp 2>/dev/null | grep -q ':8080'; then
        echo "Port 8080 is listening - application should be ready"
        echo "=== Startup Logs (last 30 lines) ==="
        tail -30 /tmp/startup.log
        echo "=== Application Started Successfully ==="
        exit 0
    else
        echo "Port 8080 is not listening - application may have failed"
        echo "=== Full Startup Logs ==="
        cat /tmp/startup.log
        exit 1
    fi
else
    echo "Java process has exited"
    echo "=== Startup Logs ==="
    cat /tmp/startup.log
    echo "=== Application Failed to Start ==="
    exit 1
fi
