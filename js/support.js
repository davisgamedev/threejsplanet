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

function makeNoiseTables(){
    if(generateNoiseTables > 0){
        for(var i = 0; i < generateNoiseTables; i++){
            var meta = {
                id: "noiseTable_" + resources.noiseTables.length + ".csv",
                size: canvasSize
            };
            resources.noiseTables.push(meta);

            $("#dataExportModalLabel").html("resources.json");
            $("#dataExportModalBody").html(JSON.stringify(resources));
            $("#dataExportModal").modal("show");
        }
    }
}

function newNoiseResource(){
    if(!optimizeNoise){
        noise.seed(Math.random());
        return;
    }
    else{
        if(resources == undefined){
            $.getJSON("data/resources.json", function(json){
                resources = json.resources;
            }).done(makeNoiseTables);


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