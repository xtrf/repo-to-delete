@echo off
set directory=../properties
set filename1=customers
set filename2=customers
echo.
echo Convertion started. Please wait.
echo.
@echo on
python convert.py prop %directory%/%filename1%-be.properties ../%filename2%-be.json
python convert.py prop %directory%/%filename1%-bg.properties ../%filename2%-bg.json
python convert.py prop %directory%/%filename1%-da.properties ../%filename2%-da.json
python convert.py prop %directory%/%filename1%-de.properties ../%filename2%-de.json
python convert.py prop %directory%/%filename1%-el.properties ../%filename2%-el.json
python convert.py prop %directory%/%filename1%-en-us.properties ../%filename2%-en-us.json
python convert.py prop %directory%/%filename1%-es.properties ../%filename2%-es.json
python convert.py prop %directory%/%filename1%-et.properties ../%filename2%-et.json
python convert.py prop %directory%/%filename1%-fi.properties ../%filename2%-fi.json
python convert.py prop %directory%/%filename1%-fr.properties ../%filename2%-fr.json
python convert.py prop %directory%/%filename1%-hu.properties ../%filename2%-hu.json
python convert.py prop %directory%/%filename1%-is.properties ../%filename2%-is.json
python convert.py prop %directory%/%filename1%-it.properties ../%filename2%-it.json
python convert.py prop %directory%/%filename1%-lt.properties ../%filename2%-lt.json
python convert.py prop %directory%/%filename1%-lv.properties ../%filename2%-lv.json
python convert.py prop %directory%/%filename1%-no.properties ../%filename2%-no.json
python convert.py prop %directory%/%filename1%-pl.properties ../%filename2%-pl.json
python convert.py prop %directory%/%filename1%-pt-br.properties ../%filename2%-pt-br.json
python convert.py prop %directory%/%filename1%-ro.properties ../%filename2%-ro.json
python convert.py prop %directory%/%filename1%-ru.properties ../%filename2%-ru.json
python convert.py prop %directory%/%filename1%-sk.properties ../%filename2%-sk.json
python convert.py prop %directory%/%filename1%-sl.properties ../%filename2%-sl.json
python convert.py prop %directory%/%filename1%-sv.properties ../%filename2%-sv.json
python convert.py prop %directory%/%filename1%-tr.properties ../%filename2%-tr.json
python convert.py prop %directory%/%filename1%-uk.properties ../%filename2%-uk.json
python convert.py prop %directory%/%filename1%-zh-cn.properties ../%filename2%-zh-cn.json
@echo off
echo.
echo.
echo Convertion completed.
pause
