var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
var sz = 2048;
canvas.width = sz;
canvas.height = sz;
var ctx = canvas.getContext('2d');

function getRandomColor(){
    var r = Math.random()*255|0;
    var g = Math.random()*255|0;
    var b = Math.random()*255|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}
var debugColors = false;
ctx.fillStyle = debugColors? "yellow": getRandomColor();
ctx.fillRect(0, 0, sz, sz);

noise.seed(Math.random());
ctx.fillStyle = debugColors? "green": getRandomColor();

 //draw noise
var step = 0.05; //noise step value
var scale = 1/step;  //noise scalar value
var psize = 5; //"pixel" size of noise

//draw each rectangle as primary color, alpha being noise
for(var x = 0; x * scale * psize < sz; x+=step){
    for(var y = 0; y * scale * psize < sz; y+=step){
        var val = noise.perlin2(x, y)/2 + 0.5;
        val = Math.floor(val * 5)/10 + .2;
        ctx.globalAlpha = val;
        ctx.fillRect(x * scale * psize, y * scale * psize, psize, psize);
    }
}


//if(!debugColors && Math.random() > 0.3 ) ctx.globalCompositeOperation = 'lighter'; 
//ctx.globalCompositeOperation = 'lighter';
noise.seed(Math.random());
ctx.globalAlpha = 1;

var wcanvas = document.createElement('canvas');
document.body.appendChild(wcanvas);
wcanvas.width = sz;
wcanvas.height = sz;
var wctx = wcanvas.getContext('2d');
wctx.fillStyle = debugColors? "blue" : getRandomColor(); //maybe make reflective?

step = 0.02;
scale = 1/step;
for(var x = 0; x * scale * psize < sz; x+=step){
    for(var y = 0; y * scale * psize < sz; y+=step){
        var a = noise.perlin2(x, y)/2 + 0.5;
        a = Math.floor(a * 5)/10 + .2;
        if(a > 0.4){
            wctx.globalAlpha = a;
            wctx.fillRect(x * scale * psize, y * scale * psize, psize, psize);
        }
    }
}

//var texture = new THREE.TextureLoader().load("assets/uvs.png");
var texture = new THREE.TextureLoader().load(canvas.toDataURL());
texture.wrapS = THREE.MirroredRepeatWrapping;
texture.wrapT = THREE.MirroredRepeatWrapping;
texture.repeat.set(2, 1);

var wtexture = new THREE.TextureLoader().load(wcanvas.toDataURL());
wtexture.wrapS = THREE.MirroredRepeatWrapping;
wtexture.wrapT = THREE.MirroredRepeatWrapping;
wtexture.repeat.set(2, 1);

var geometry = new THREE.SphereGeometry(30, 50, 50);
//var material = new THREE.MeshNormalMaterial();
var material = new THREE.MeshLambertMaterial( {color: 0xffffff, map: texture});

//material.flatShading = true;
var obj = new THREE.Mesh( geometry, material );
scene.add( obj );

camera.position.z = 80;
var stats = new Stats();
stats.showPanel(2);
document.body.appendChild( stats.dom );

var light = new THREE.PointLight( 0xffffff, 1, 300);
light.position.set(40, 40, 70);
scene.add(light);


var skycanvas = document.createElement('canvas');
document.body.appendChild(skycanvas);
var skysz = 2048;
skycanvas.width = skysz;
skycanvas.height = skysz;
var skyctx = skycanvas.getContext('2d');
skyctx.fillStyle = "rgb(10, 0, 20)";
skyctx.fillRect(0, 0, skysz, skysz);
for(var i = 0; i < 5000; i++){
    skyctx.fillStyle = "hsl(" + (Math.random() * 360) + ", " + (Math.random() *60 )+ "%,  80%)";
    skyctx.fillRect(
        Math.random() * skysz, 
        Math.random() * skysz, 
        Math.random() * 5, 
        Math.random() * 5
        );
}

var wgeometry = new THREE.SphereGeometry(30.01, 50, 50);
//var material = new THREE.MeshNormalMaterial();
var wmaterial = new THREE.MeshPhongMaterial( {
    color: 0xffffff, 
    map: wtexture, 
    combine: THREE.MixOperation,
    reflectivity: 0.5,
    transparent: true,
    shininess: 100
});

var wobj = new THREE.Mesh( wgeometry, wmaterial );
scene.add( wobj );

var image = skycanvas.toDataURL();
var URLS = []; for(var i = 0; i < 6; i++) URLS.push(image);
var textureCube = new THREE.CubeTextureLoader().load(URLS, () => {
    wmaterial.envMap = textureCube;
    wmaterial.needsUpdate = true;
});
scene.background = textureCube;

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;

//document.body.appendChild( THREE.UVsDebug( geometry, 2048));

var animate = function () {
    stats.update();
    requestAnimationFrame( animate );

    //obj.rotation.x += 0.01;
    obj.rotation.y += 0.01;
    wobj.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();