var resources;
var noiseTable;
var noiseTableMeta;
var noiseTableChannel;

var noiseTableGenerationIndex;

var ntCanvas = document.createElement('canvas');
document.body.appendChild(ntCanvas);
ntCanvas.width = canvasSize;
ntCanvas.height = canvasSize;
var ntCtx = ntCanvas.getContext('2d');
ntCanvas.style.display = "none";  

function fetchTileableNoise(x, y, scale){
    if(useOptimizedNoise && !generateNoiseTables)
        return noiseTable.data[ 
                ((y * canvasSize) * canvasSize * 4) + 
                ((x * canvasSize) * 4) + 
                noiseTableChannel] 
            / 256;
    else   
        return getTileableNoise(x, y, scale);
}

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

    for(var channel = 0; channel < dataChannelsPerTable; channel++){
        noise.seed(Math.random());
        for(var x = 0; x < canvas.width; x++){
            for(var y = 0; y < canvas.height; y++){
                imageData.data[(y * canvas.height*4) + (x*4) + channel] = 
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
    if(noiseTableGenerationIndex > 0){

        noiseTableGenerationIndex--;

        tableNoiseScale = 1;
        if(noiseTableGenerationIndex <= generateNoiseTablesAmountScaled ){
            tableNoiseScale = ((noiseTableGenerationIndex + 1) * .2).toFixed(1);
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
            noiseTableGenerationIndex > 0 ? createNoiseTableHelper : emitResourcesJSON);
    }
}

function createNoiseTables(){
    noiseTableGenerationIndex = generateNoiseTablesAmount;
    createNoiseTableHelper();
}


function newNoiseResource(tableScale=1){
    if(!useOptimizedNoise || generateNoiseTables){
        noise.seed(Math.random());
        return;
    }
    else if(resources == undefined){
            
        var stall = true;

        $.when(           
            $.getJSON("data/resources.json", function(json){
                resources = json.resources;
            }))
            .then(function(){
                if(generateNoiseTables) createNoiseTables();
                else loadNoiseTable();
            });
        
    }
    else loadNoiseTable();
}

function loadNoiseTable(){
    //set up current noise table
    if(noiseTable == undefined || noiseTable >= dataChannelsPerTable){
        noiseTableChannel = 0;
        // var meta = {
        //     url: "noiseTableBundle_" + resources.noiseTables.length + ".csv",
        //     size: canvasSize,
        //     scale: tableNoiseScale
        // };
        //resources.noiseTables.push(meta);
        // var generateNoiseTablesAmount = 10;
        // var generateNoiseTablesAmountScaled = 3;
        var tables = resources.noiseTables.filter(
            meta => meta.scale == tableScale.toFixed(1)
        )
        noiseTableMeta = tables[Math.floor(Math.random() * tables.length)];
        
        var image = new Image();
        img.src = noiseTableMeta.url;
        ntCtx.drawImage(image, 0, 0, canvasSize, canvasSize);
        noiseTable = ntCtx.getImageData(0, 0, canvasSize, canvasSize);
    }
    else {
        noiseTableChannel++;
    }
}