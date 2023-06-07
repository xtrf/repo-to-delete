@echo off
mkdir ..\properties
echo.
echo.
echo Convertion started. Please wait.
echo.
@echo on
python convert.py json ../customers-en-us.json ../properties/customers-en-us.properties
@echo off
echo.
echo.
echo Convertion completed.
pause