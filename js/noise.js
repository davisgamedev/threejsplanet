
/////////////////////////NoiseOptomization/////////////////
var resources;
var noiseTable;
var currentNoiseTable = 0;
var lastNoiseTable;

function emitResourcesJSON(){
    $("#dataExportModalLabel").html("resources.json");
    $("#dataExportModalBody").html(JSON.stringify(resources));
    $("#dataExportModal").modal("show");
}


/*
    Todo:
        - noise table object, src, size, data, etc
        - we have to emit each noise table resource, right now its every four
        - noise table is just the source and layer
        - emit after each layer
*/

function createNoiseTables(){
    currentNoiseTable = generateNoiseTables;
    createNoiseTables();
}


function createNoiseTables(){
    if(currentNoiseTable > 0){
        currentNoiseTable--;

        tableNoiseScale = 1;
        if(currentNoiseTable <= generateScaledNoiseTables ){
            tableNoiseScale = currentNoiseTable* .2;
        }

        //this needs to be modified to add one for each layer
        let url = "noiseBundle_" + currentNoiseTable + ".png"
        for (var i = 0; i < 4; i++) {
            var meta = {
                url: url,
                layerNum: i,
                size: canvasSize,
                scale: tableNoiseScale,
            };
            resources.noiseTables.push(meta);
        }

        var package = createNoiseTableImage(tableNoiseScale);

        $("#dataExportModalLabel").html(url);
        $("#dataExportModalBody").html("<img src='" + package + "'>");
        $("#dataExportModal").modal("show");
        $("#dataExportModal").on("hidden.bs.modal",
            currentNoiseTable > 0 ? createNoiseTableHelper : emitResourcesJSON);
    }
}

//new plan: build png, save four tables per png: r, g, b, a
function createNoiseTableImage(tableNoiseScale){
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    var ctx = canvas.getContext('2d');

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for(var channel = 0; channel < 4; channel++){
        noise.seed(Math.random());
        for(var x = 0; x < canvas.width; x++){
            for(var y = 0; y < canvas.height; y++){
                imageData.data[ (y * canvas.height*4) + (x*4) + channel] = 
                    getTileableNoise(x/canvasSize, y/canvasSize, tableNoiseScale)
                    * 256;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
    canvas.style.display = "none"; 
    return canvas.toDataURL();
}

function newNoiseResource(){
    if(!optimizeNoise){
        noise.seed(Math.random());
        return;
    }
    else if(resources == undefined){
        optimizeNoise = false; //allow threads to continue during generation phase
        $.getJSON("data/resources.json", function(json){
            resources = json.resources;
        }).done(createNoiseTables);
    }
    else {
        do {
            currentNoiseTable = Math.floor(Math.random() * resources.noiseTables.length);
        }
        while (currentNoiseTable != lastNoiseTable);
        lastNoiseTable = currentNoiseTable;
        
    }
}


function fetchTileableNoise(x, y, scale){
    
}


function getTileableNoise(x, y, scale){
    //wrap 2d perlin around 3d torus for tileable
    //https://gamedev.stackexchange.com/questions/23625/how-do-you-generate-tileable-perlin-noise/23679#23679
    var ct = 1;
    var at = 4;
    
    var xt = (ct + at * Math.cos(2 * Math.PI * y))
                * Math.cos(2*Math.PI*x);

    var yt = (ct + at * Math.cos(2 * Math.PI * y))
                * Math.sin(2 * Math.PI * x);

    var zt = at * Math.sin(2 * Math.PI * y);
    return noise.perlin3( xt*scale, yt*scale, zt*scale)/2 + 0.5 ; // torus
}
