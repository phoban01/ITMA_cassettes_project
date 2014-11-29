import msaf,random

word_file_path = "/usr/share/dict/words"
word_file = open(word_file_path)
words = word_file.read().splitlines()
word_file.close()

root = "/Users/itma/Documents/piaras_scripts/MSAF_seg/"

audio_path = root+"audio/"
labels_path = root+"labels.txt"
input_audio = audio_path + "testb.wav"

config = {
    "dirichlet" :   True,
    "xmeans"    :   True,
    "k"         :   6,

    "M_gaussian"    : 16,
    "m_embedded"    : 3,
    "k_nearest"     : 0.06,
    "Mp_adaptive"   : 24,
    "offset_thres"  : 0.04

}

est_times, est_labels = msaf.process(input_audio, feature="hpcp", boundaries_id="sf", labels_id="fmc2d",config=config)

print 'writing data'

labels_file = open(labels_path,"w")

data = zip(est_times,est_labels)

names = [random.choice(words) for i in range(len(est_labels))]

for i in data:
	labels_file.write("%s %s\n" % (i[0],names[int(i[-1])]))

labels_file.close()
