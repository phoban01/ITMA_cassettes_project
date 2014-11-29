import os,subprocess,pickle,json

# don't need once we have the pickle file made
def get_folders(path):
	folder_store = []
	for root,folders,f in os.walk(server_path):
		if len(folders) > 0:
			for j in folders:
				if j.find('CS') != -1:
					folder_store.append(root+'/'+j)
	folder_store.sort(key=lambda x:int(x.split('/')[-1].split('-')[0]))
	return folder_store

def run_segmentation(f):
	cmd = ["rms_segmenter",f]
	print "Segmenting %s" % f 
	data = subprocess.check_output(cmd)
	print "Segmentation Complete"
	data = data.split('$')
	segments = data[0].split()
	peaks = [float(i.strip()) for i in data[-1].split(',')]
	return segments,peaks

def make_seg_pairs(seg_list):
	segments = []
	for i in range(0,len(seg_list)-1,2):
		segments.append({"start":seg_list[i],"end":seg_list[i+1]})
	return segments

def process_folder(folder,cat_recs,metadata_path):
	server_address = 'http://172.10.20.72/'
	refno = folder.split('/')[-1]
	metadata = {'segments':{},'wav_url':{},'waveform_peaks':{}}
	metadata['refno'] = refno
	metadata['jpeg_url'] = folder.replace('/Volumes/',server_address) + '/' + (refno + '-JPEG.jpg')
	metadata['pdf_url'] = folder.replace('/Volumes/',server_address) + '/' + (refno + '-PDF.pdf')
	try:
		for i in cat_recs[refno]:
			if cat_recs[refno][i] != None:
				metadata[i.lower()] = cat_recs[refno][i].encode('utf-8')
			else:
				metadata[i.lower()] = ""
		for i in os.listdir(folder):
			if i.endswith('.wav'):
				path = folder + '/' + i
				# run segmentation
				segs,peaks = run_segmentation(path)
				side = i.split('_')[-1].split('.')[0]
				side = 'side_%s' % side.lower()
				segment_pairs = make_seg_pairs(segs)
				metadata['segments'][side] = segment_pairs
				metadata['waveform_peaks'][side] = peaks
				metadata['wav_url'][side] = path.replace('/Volumes/',server_address)
		json_path = metadata_path + (refno + '-META.json')
		json_file = open(json_path,"w")
		json.dump(metadata,json_file,indent=4)
		json_file.close()
	except:
		print "No catalogue information for this refno"

server_path = "/Volumes/ITMADATA/AUDIO/commercial sound recordings/digitised cassettes/"

pkl_file = open("/Users/itma/Documents/piaras_scripts/WorkCode/CS_metadata_setup/cs_folders.pkl","r");
folders = pickle.load(pkl_file)
pkl_file.close()

cat_recs_file = open("/Users/itma/Documents/piaras_scripts/WorkCode/CS_metadata_setup/cs_meta.json","r")
cat_recs = json.load(cat_recs_file)
cat_recs_file.close()

folders.sort(key=lambda x:int(x.split('/')[-1].split('-')[0]))

metadata_path = "/Users/itma/Documents/piaras_scripts/WebAudioPlayer/data/"

for f in folders[0:35]:
	print f
	process_folder(f,cat_recs,metadata_path)	