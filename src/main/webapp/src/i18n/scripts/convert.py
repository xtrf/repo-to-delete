__author__ = "Maurycy Michalski"
__copyright__ = "Copyright 2012, Eutecert"

import sys, json, properties;
from properties import Properties;

if len(sys.argv) < 4:
	exit("Run program with following arguments: <source_type_(json|prop)> <source_file> <target_file>")

if "json" == sys.argv[1]:
    # convert from json to properties
	file = open(sys.argv[2], "r")
	jsonObj = json.loads(file.read())
	properties = Properties()
	properties.fromStructure([], jsonObj)
	properties.store(open(sys.argv[3],'w'))

else:
    # convert from properties to json
	file = open(sys.argv[2], "r")
	properties = Properties()
	properties.load(file)
	jsonObj = json.dumps(properties.getStructure(), sort_keys = True, indent = 4, ensure_ascii = False)
	f = open(sys.argv[3],'w')
	f.write(jsonObj)
	f.close()
