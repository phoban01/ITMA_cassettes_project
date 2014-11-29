import os,collections,json
import xml.etree.cElementTree as ET

def merge_equals(data):
	out = ""
	for i in data:
		if not i.endswith('='):
			out += i.strip() + '\n'
		else:
			out += i.strip()
	out = out.replace(' =','=').replace('= ','=').replace('=',' = ')
	out = out.split('\n')
	return out	

def parseXML(tree):
	records = {}
	for record in tree.iter(tag=idstring+"Record"):
		details = record.getchildren()
		metadata = {}
		for i in details:
			stag = i.tag.replace(idstring,'')
			metadata[stag] = i.text
		records[metadata['REFNO']] = metadata
	return records

idstring = "{http://www.inmagic.com/webpublisher/query}"

source = "/Users/itma/Documents/piaras_scripts/WorkCode/CS_metadata_setup/cassettes_metadata.xml"
out = "/Users/itma/Documents/piaras_scripts/WorkCode/CS_metadata_setup/cs_meta.json"
tree = ET.ElementTree(file=source)

data =	parseXML(tree)

outfile = open(out,"w")

json.dump(data,outfile,indent=4)
outfile.close()

