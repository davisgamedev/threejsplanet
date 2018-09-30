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
