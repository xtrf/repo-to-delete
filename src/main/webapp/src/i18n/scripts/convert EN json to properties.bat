@echo off
mkdir ..\properties
echo.
echo.
echo Convertion started. Please wait.
echo.
@echo on
python convert.py json ../customers-en.json ../properties/customers-en.properties
@echo off
echo.
echo.
echo Convertion completed.
pause