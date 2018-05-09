function getRandomColor(){
    var r = Math.random()*255|0;
    var g = Math.random()*255|0;
    var b = Math.random()*255|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function getRandomHSB(h){
    if(!h) h = Math.random()*360|0;
    var s = Math.random()*100|0;
    var b = Math.random()*100|0;
    return 'hsl(' + h + ',' + s + '%,' + b + '%)';
}

function assembleHSB(h, s, b){
    return 'hsl(' + h + ',' + s + '%,' + b + '%)';
}

function randomVariationRange(source, minVar, maxVar){
    return randomRange(source * minVar, source * maxVar);
}

function randomRange(from, to){
    return Math.random() * (to-from) + from;
}

function flipCoin(chanceSuccess){
    return Math.random() < chanceSuccess;
}


/////////////////////////NoiseOptomization/////////////////
var resources;
var noiseTable;

function emitResourcesJSON(){
    $("#dataExportModalLabel").html("resources.json");
    $("#dataExportModalBody").html(JSON.stringify(resources));
    $("#dataExportModal").modal("show");
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


function createNoiseTableHelper(){
    if(currentNoiseTable > 0){

        currentNoiseTable--;

        tableNoiseScale = 1;
        if(currentNoiseTable <= generateScaledNoiseTables ){
            tableNoiseScale = currentNoiseTable* .2;
        }

        var meta = {
            url: "noiseTableBundle_" + resources.noiseTables.length + ".csv",
            size: canvasSize,
            scale: tableNoiseScale
        };
        resources.noiseTables.push(meta);

        var imageSrc = createNoiseTableImage(tableNoiseScale);

        $("#dataExportModalLabel").html(meta.url);
        $("#dataExportModalBody").html("<img src='" + imageSrc + "'>");
        $("#dataExportModal").modal("show");
        $("#dataExportModal").on("hidden.bs.modal",
            currentNoiseTable > 0 ? createNoiseTableHelper : emitResourcesJSON);
    }
}

var currentNoiseTable = 0;
function createNoiseTables(){
    currentNoiseTable = generateNoiseTables;
    createNoiseTableHelper();
}


function newNoiseResource(){
    if(!optimizeNoise){
        noise.seed(Math.random());
        return;
    }
    else{
        if(resources == undefined){
            optimizeNoise = false; //allow threads to continue during generation phase
            $.getJSON("data/resources.json", function(json){
                resources = json.resources;
            }).done(createNoiseTables);
        }
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