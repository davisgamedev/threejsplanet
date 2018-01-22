//set up render elements
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 80;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.PointLight( 0xffffff, 1, 300);
light.position.set(40, 40, 70);
scene.add(light);

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;

var stats = new Stats();
stats.showPanel(2);
document.body.appendChild( stats.dom );


//control vars
var debugColors = false;
var debugTexutures = true;



////////////////////body//////////////////////////
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
var sz = 2048;
canvas.width = sz;
canvas.height = sz;
var ctx = canvas.getContext('2d');


ctx.fillStyle = debugColors? "yellow": getRandomColor();
ctx.fillRect(0, 0, sz, sz);

noise.seed(Math.random());
ctx.fillStyle = debugColors? "green": getRandomColor();

var psize = 5; //"pixel" size of noise

for(var x = 0; x < 1; x += psize/sz){
    for(var y = 0; y < 1; y += psize/sz){
        //var a = noise.perlin2(x, y)/2 + 0.5;
        var a = getTileableNoise(noise, x, y, 1);

        a = Math.floor(a * 5)/10 + .2;
        ctx.globalAlpha = a;
        ctx.fillRect(x * sz, y * sz, psize, psize);
    }
}

//var texture = new THREE.TextureLoader().load("assets/uvs.png");
var texture = new THREE.TextureLoader().load(canvas.toDataURL());
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 1);
if(!debugTexutures) canvas.style.display = "none";


var geometry = new THREE.SphereGeometry(30, 50, 50);
var material = new THREE.MeshLambertMaterial( {color: 0xffffff, map: texture});
var obj = new THREE.Mesh( geometry, material );
scene.add( obj );




//////////////////////////////Water Texture/////////////////////////////////

noise.seed(Math.random());

var wcanvas = document.createElement('canvas');
document.body.appendChild(wcanvas);
wcanvas.width = sz;
wcanvas.height = sz;
var wctx = wcanvas.getContext('2d');
wctx.fillStyle = debugColors? "blue" : getRandomColor(); //maybe make reflective?


var scale = Number(Math.random().toFixed(1)) + 0.1;
if(scale > 1) scale = 1;
for(var x = 0; x < 1; x += psize/sz){
    for(var y = 0; y < 1; y += psize/sz){
        //var a = noise.perlin2(x, y)/2 + 0.5;
        var a = getTileableNoise(noise, x, y, scale);
        
        a = Math.floor(a * 5)/10 + .2;
        if(a > 0.4){
            wctx.globalAlpha = a + .2;
            //cctx.fillRect(x * scale * psize, y * scale * psize, psize, psize);
            wctx.fillRect(x * sz, y * sz, psize, psize);
        }
    }
}

var wtexture = new THREE.TextureLoader().load(wcanvas.toDataURL());
wtexture.wrapS = THREE.RepeatWrapping;
wtexture.wrapT = THREE.RepeatWrapping;
wtexture.repeat.set(3, 1);
if(!debugTexutures) wcanvas.style.display = "none";

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

//clouds

noise.seed(Math.random());
/////////////////////////////////Clouds///////////////////////////
var ccanvas = document.createElement('canvas');
document.body.appendChild(ccanvas);
ccanvas.width = sz;
ccanvas.height = sz;
var cctx = ccanvas.getContext('2d');
cctx.fillStyle = debugColors? "white" : getRandomColor(); 

for(var x = 0; x < 1; x += psize/sz){
    for(var y = 0; y < 1; y += psize/sz){
        var a = getTileableNoise(noise, x, y, 1);

        a = Math.floor(a * 5)/10 + .2;
        if(a > 0.3){
            cctx.globalAlpha =  a - 0.2;
            cctx.fillRect(x * sz, y * sz, psize, psize);
        }
    }
}

var ctexture = new THREE.TextureLoader().load(ccanvas.toDataURL(), () => {
    wmaterial.envMap = ctexture;
    wmaterial.needsUpdate = true;
});
ctexture.wrapS = THREE.RepeatWrapping;
ctexture.wrapT = THREE.RepeatWrapping;
ctexture.repeat.set(1, 2);
if(!debugTexutures) ccanvas.style.display = "none";

var cgeometry = new THREE.SphereGeometry(30.5, 50, 50);
//var material = nec THREE.MeshNormalMaterial();
var cmaterial = new THREE.MeshLambertMaterial( {
    color: 0xffffff, 
    map: ctexture, 
    transparent: true,
});

var cobj = new THREE.Mesh( cgeometry, cmaterial );
scene.add( cobj );

//skybox
noise.seed(Math.random());
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

var image = skycanvas.toDataURL();
var URLS = []; for(var i = 0; i < 6; i++) URLS.push(image);
var textureCube = new THREE.CubeTextureLoader().load(URLS, () => {
    wmaterial.envMap = textureCube;
    wmaterial.needsUpdate = true;
});
scene.background = textureCube;
if(!debugTexutures) skycanvas.style.display = "none";


//document.body.appendChild( THREE.UVsDebug( geometry, 2048));

var animate = function () {
    stats.update();
    requestAnimationFrame( animate );

    //obj.rotation.x += 0.01;
    obj.rotation.y += 0.01;
    wobj.rotation.y += 0.01;
    cobj.rotation.y += 0.005;

    renderer.render(scene, camera);
};

animate();