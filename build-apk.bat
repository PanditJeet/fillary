@echo off
echo ===================================================
echo         Fillary - Android APK Build Tool
echo ===================================================
echo.

echo [1/3] Building Web Production Assets...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error during web build!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Syncing Capacitor Android Project...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Error during Capacitor sync!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compiling Android Debug APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo If Android SDK is not found locally, please open the 'android' folder in Android Studio
    echo or use the automated GitHub Actions cloud builder to download the APK.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo [SUCCESS] APK Built Successfully!
echo Location: android\app\build\outputs\apk\debug\app-debug.apk
echo ===================================================
pause
