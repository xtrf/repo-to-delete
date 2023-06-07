@echo off
set directory=../properties
set filename1=customers
set filename2=customers
echo.
echo Convertion started. Please wait.
echo.
@echo on
convert.py prop %directory%/%filename1%-be.properties ../%filename2%-be.json
convert.py prop %directory%/%filename1%-bg.properties ../%filename2%-bg.json
convert.py prop %directory%/%filename1%-da.properties ../%filename2%-da.json
convert.py prop %directory%/%filename1%-de.properties ../%filename2%-de.json
convert.py prop %directory%/%filename1%-el.properties ../%filename2%-el.json
convert.py prop %directory%/%filename1%-en-us.properties ../%filename2%-en-us.json
convert.py prop %directory%/%filename1%-es.properties ../%filename2%-es.json
convert.py prop %directory%/%filename1%-et.properties ../%filename2%-et.json
convert.py prop %directory%/%filename1%-fi.properties ../%filename2%-fi.json
convert.py prop %directory%/%filename1%-fr.properties ../%filename2%-fr.json
convert.py prop %directory%/%filename1%-hu.properties ../%filename2%-hu.json
convert.py prop %directory%/%filename1%-is.properties ../%filename2%-is.json
convert.py prop %directory%/%filename1%-it.properties ../%filename2%-it.json
convert.py prop %directory%/%filename1%-lt.properties ../%filename2%-lt.json
convert.py prop %directory%/%filename1%-lv.properties ../%filename2%-lv.json
convert.py prop %directory%/%filename1%-no.properties ../%filename2%-no.json
convert.py prop %directory%/%filename1%-pl.properties ../%filename2%-pl.json
convert.py prop %directory%/%filename1%-pt-br.properties ../%filename2%-pt-br.json
convert.py prop %directory%/%filename1%-ro.properties ../%filename2%-ro.json
convert.py prop %directory%/%filename1%-ru.properties ../%filename2%-ru.json
convert.py prop %directory%/%filename1%-sk.properties ../%filename2%-sk.json
convert.py prop %directory%/%filename1%-sl.properties ../%filename2%-sl.json
convert.py prop %directory%/%filename1%-sv.properties ../%filename2%-sv.json
convert.py prop %directory%/%filename1%-tr.properties ../%filename2%-tr.json
convert.py prop %directory%/%filename1%-uk.properties ../%filename2%-uk.json
convert.py prop %directory%/%filename1%-zh-cn.properties ../%filename2%-zh-cn.json
@echo off
echo.
echo.
echo Convertion completed.
pause
