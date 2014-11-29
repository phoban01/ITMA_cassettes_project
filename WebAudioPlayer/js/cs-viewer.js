'use strict';

function loadJSON(filepath,callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filepath, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
}

function createTracks() {
    // create regions
    for (var i = 0; i < segments['side_a'].length;i++) {
        var r = {
            id: 'side-a ' + i,
            start: segments['side_a'][i]['start'],
            end: segments['side_a'][i]['end'],
            drag:false
        };       
        // side_a_regions.push(wavesurfer.addRegion(r));
        side_a_segments.push(r);
        $('<a href="#" class="list-group-item"><i class="glyphicon glyphicon-play"></i> Track '+ (i+1) + '</a>').appendTo('#side-a-list-group')    
    } 
    for (var i = 0; i < segments['side_b'].length;i++) {
        var r = {
            id: 'side-b ' + i,
            start: segments['side_b'][i]['start'],
            end: segments['side_b'][i]['end'],
            drag:false
        };       
        side_b_segments.push(r);
        $('<a href="#" class="list-group-item"><i class="glyphicon glyphicon-play"></i> Track '+ (i+1) + '</a>').appendTo('#side-b-list-group')            
    }  
}

function transportInit() {
    document.getElementById('playbutton').onclick = function() {
        wavesurfer.play()
    };
    document.getElementById('pausebutton').onclick = function() {
        wavesurfer.pause()
    };
    document.getElementById('stopbutton').onclick = function() {
        wavesurfer.stop()
    };
}

function regionInit() {
    // region loading and playback
    document.getElementById('side-a-tab').onclick = function() {
        if (current_side != 'side_a') {
            wavesurfer.clearRegions();
            wavesurfer.load(json_data.wav_url.side_a,json_data.waveform_peaks.side_a);
            current_side = 'side_a';
        }
    };

    document.getElementById('side-b-tab').onclick = function() {
        if (current_side != 'side_b') {
            wavesurfer.clearRegions();            
            wavesurfer.load(json_data.wav_url.side_b,json_data.waveform_peaks.side_b);
            current_side = 'side_b';
        }
    };

    document.getElementById("side-a").onclick = function(e) {
        var region_index = e.srcElement.text.split(' ').pop() - 1;
        wavesurfer.addRegion(side_a_segments[region_index]).play();
    };

    document.getElementById("side-b").onclick = function(e) {
        var region_index = e.srcElement.text.split(' ').pop() - 1;
        wavesurfer.addRegion(side_b_segments[region_index]).play();
    }; 
}

function mainInit(json_path) {
    loadJSON(json_path,function(response) {
        json_data = JSON.parse(response);

        // set image
        if (json_data.image_url) {
            document.getElementById('album-cover-image').src = json_data.jpeg_url;
            document.getElementById('pdf-iframe').src = json_data.pdf_url;
            document.getElementById('album-cover-image-holder').setAttribute("style","display:none")            

        } else {
            document.getElementById('album-cover-image').setAttribute("style","display:none");            
            document.getElementById('pdf-view-button').setAttribute("style","display:none"); 
        }

        // catalogue info
        document.getElementById('refno-text').innerText = json_data.refno;
        document.getElementById('cs-title').innerText = "Cassette Title: " + json_data.title;
        document.getElementById('cs-artist').innerText = "Artist: " + json_data.mainperformers;
        document.getElementById('cs-pub').innerText = "Publisher: " + json_data.publisher;
        document.getElementById('cs-cat-no').innerText = "Catalogue Number: " + json_data.cataloguenumber;
        document.getElementById('cs-year').innerText = "Year: " + json_data.year;
        document.getElementById('cs-p-description').innerText = "Physical Description: " + json_data.physicaldescription;

        // link to 48k audio
        document.getElementById('side-one-raw').href = json_data.wav_url.side_a;
        document.getElementById('side-two-raw').href = json_data.wav_url.side_b;

        // segments
        segments = json_data.segments;

        var options = {
            container     : document.querySelector('#waveform'),
            waveColor     : 'rgba(0,0,0,0.5)',
            progressColor : 'rgba(80,190,255,0.5)',
            cursorColor   : 'navy',
            cursorWidth : 0,
            interact    : false,
            normalize:true,
            backend:'AudioElement'
        };

        if (location.search.match('scroll')) {
            options.minPxPerSec = 50;
            options.scrollParent = true;
        }

        if (location.search.match('normalize')) {
            options.normalize = true;
        }

        // Init
        wavesurfer.init(options);
        // Load audio from URL
        wavesurfer.load(json_data.wav_url.side_a,json_data.waveform_peaks.side_a);



        if (wavesurfer.enableDragSelection) {
            wavesurfer.enableDragSelection({
                color: 'rgba(0, 255, 0, 0.1)'
            });
        };

        createTracks();
    });    
}

function loadingDisplayInit() {
    var progressDiv = document.querySelector('.progress');
    var progressBar = progressDiv.querySelector('#loading-bar');
    var loadingText = document.querySelector('#loading')
    var timelineDiv = document.querySelector('#wave-timeline')

    var showProgress = function (percent) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
        loadingText.style.display = 'inline'; 
        // timelineDiv.style.display = 'none'  
        wavesurfer.clearRegions();     
    };

    var hideProgress = function () {
        progressDiv.style.display = 'none';
        loadingText.style.display = 'none';
        // timelineDiv.style.display = 'block';     
        // Regions
        if (current_side == 'side_a') {
            for (var i = 0; i < json_data.segments.side_a.length;i++) {
                wavesurfer.addRegion(json_data.segments.side_a[i]);
            }
        } else {
            for (var i = 0; i < json_data.segments.side_b.length;i++) {
                wavesurfer.addRegion(json_data.segments.side_b[i]);
            }          
        }
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);    
}

function make_cassette_display() {
    //get json from url
    var json_path = location.search.split('=').pop();
    //create an instance of wavesurfer
    wavesurfer = Object.create(WaveSurfer);
    console.log(json_path);
    //main
    document.addEventListener('DOMContentLoaded', function () {
        if (json_path) {
            mainInit(json_path);
            transportInit();
            regionInit();
            loadingDisplayInit();
        } else {
            document.querySelector('#loading').innerText = "No JSON File Found"
        }
    });
}

// global variables
var wavesurfer,json_data,segments,side_a_segments=[],side_b_segments=[],side_a_regions=[],side_b_regions=[];
var b_regions_loaded = false,current_side='side_a';

make_cassette_display();
