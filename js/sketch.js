//set up render elements
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 70;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var light = new THREE.PointLight( 0xffffff, 1, 300);
light.position.set(40, 40, 70);
scene.add(light);

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;
controls.enableKeys = false;
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;

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

var h1 = Math.random() * 360;
ctx.fillStyle = debugColors? "yellow": getRandomColor();
console.log(ctx.fillStyle);
ctx.fillRect(0, 0, sz, sz);

//prevent blending by getting hsb color at least 40deg away
var h2 = (h1 + 180 + (Math.random() * 180)) % 360;
noise.seed(Math.random());
ctx.fillStyle = debugColors? "green": getRandomColor();
console.log(ctx.fillStyle);
var psize = 5; //"pixel" size of noise

for(var x = 0; x < 1; x += psize/sz){
    for(var y = 0; y < 1; y += psize/sz){
        //var a = noise.perlin2(x, y)/2 + 0.5;
        var a = getTileableNoise(noise, x, y, 1);

        a = Math.floor(a * 5)/10 + 0.2;
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

/*
    TODO: optomizations
        - recycle noise maps
        - random value arrays

*/


//////////////////////////////Water and City Texture/////////////////////////////////
//add city lights to water layer where shallow enough
noise.seed(Math.random());

var wcanvas = document.createElement('canvas');
document.body.appendChild(wcanvas);
wcanvas.width = sz;
wcanvas.height = sz;
var wctx = wcanvas.getContext('2d');
wctx.fillStyle = debugColors? "blue" : getRandomColor(); //maybe make reflective?

var lcanvas = document.createElement('canvas');
document.body.appendChild(lcanvas);
lcanvas.width = sz;
lcanvas.height = sz;
var lctx = lcanvas.getContext('2d');
lctx.fillStyle = "white";
lctx.strokeStyle = "white";

var scale = Number(Math.random().toFixed(1)) + 0.2;
if(scale > 1) scale = 1;
for(var x = 0; x < 1; x += psize/sz){
    for(var y = 0; y < 1; y += psize/sz){
        //var a = noise.perlin2(x, y)/2 + 0.5;
        var a = getTileableNoise(noise, x, y, scale);
        
        if(a <= .6){
            //probability of city: random + adjustment < (distance to equator + distance to coast(weighted))
            var d_equator = 1 - Math.abs(y - 0.5)*2; //distance to equator
            var c_spread = 0.55; //spread away from coast, out of .6
            var frequency = .75; //modifies chance of event occuring, higher is less likely
            if(Math.random() + frequency < (d_equator + 2*(a/c_spread))/3) {
                if(flipCoin(0.3)) continue;

                lctx.globalAlpha = Math.random(); 

                lctx.fillRect( x*sz - psize/2, y*sz, Math.random() * psize, Math.random() * psize);
                lctx.fillRect( x*sz - psize/2, y*sz - psize/2, Math.random() * psize, Math.random() * psize);
                lctx.fillRect( x*sz, y*sz - psize/2, Math.random() * psize, Math.random() * psize);
                lctx.fillRect( x*sz, y*sz, randomVariationRange(psize, 0, 2), randomVariationRange(psize, 0, 2));
                
                if(flipCoin(0.85)) continue;
                lctx.globalAlpha -= 0.2;

                for(var i = randomRange(1, 8); i >= 0; i--){
                    lctx.beginPath();
                    lctx.moveTo(x*sz, y*sz);
                    var ex = x*sz + psize*randomRange(-12, 12);
                    var ey = y*sz + psize*randomRange(-12, 12);
                    if(getTileableNoise(noise, ex/sz, ey/sz, scale) > 0.6 || getTileableNoise(noise, (ex/sz + x)/2, (ey/sz + y)/2, scale) > 0.6) break;
                    lctx.bezierCurveTo(randomRange(x*sz, ex), randomRange(y*sz, ey), randomRange(x*sz, ex), randomRange(y*sz, ey) , ex, ey);
                    lctx.lineTo(ex, ey);
                    lctx.stroke();
                }
                
            }
        }
        else if( a > .6){
            a = Math.floor(a * 5)/10;
            wctx.globalAlpha = a + .3;
            wctx.fillRect(x * sz, y * sz, psize, psize);
        }
    }
}

var wtexture = new THREE.TextureLoader().load(wcanvas.toDataURL());
wtexture.wrapS = THREE.RepeatWrapping;
wtexture.wrapT = THREE.Re1peatWrapping;
wtexture.repeat.set(3, 1);
if(!debugTexutures) wcanvas.style.display = "none";

var ltexture = new THREE.TextureLoader().load(lcanvas.toDataURL());
ltexture.wrapS = THREE.RepeatWrapping;
ltexture.wrapT = THREE.RepeatWrapping;
ltexture.repeat.set(3, 1);
if(!debugTexutures) lcanvas.style.display = "none";

var wgeometry = new THREE.SphereGeometry(30.01, 50, 50);
//var material = new THREE.MeshNormalMaterial();
var wmaterial = new THREE.MeshPhongMaterial( {
    color: 0xffffff, 
    map: wtexture, 
    //emissiveMap: wtexture, //radioactive lakes lol
    combine: THREE.MixOperation,
    reflectivity: 0.5,
    transparent: true,
    shininess: 100
});
var wobj = new THREE.Mesh( wgeometry, wmaterial );
scene.add( wobj );

var tobj = new THREE.Mesh(
    new THREE.SphereGeometry(30.01, 50, 50),
    new THREE.MeshBasicMaterial( {
        transparent: true,
        map: ltexture,
        color: assembleHSB(Math.random() * 360, 100, 80)
    })
)
scene.add(tobj);


/////////////////////////////////Clouds///////////////////////////
var clouds = [];
var h = Math.random() * 360;
for(var i = 0; i < 3; i++){
    noise.seed(Math.random());

    var ccanvas = document.createElement('canvas');
    document.body.appendChild(ccanvas);
    ccanvas.width = sz;
    ccanvas.height = sz;
    var cctx = ccanvas.getContext('2d');
    cctx.strokeStyle = "rgba(0, 0, 0, 0)";
    cctx.fillStyle = debugColors? "white" : assembleHSB(h, 80, 60 + i*40); 
    
    for(var x = 0; x < 1; x += psize/sz){
        for(var y = 0; y < 1; y += psize/sz){
            var a = getTileableNoise(noise, x, y, .8/((2-i)+1));
    
            a = Math.floor(a * 5)/10 + .2;
            if(a > 0.4){
                cctx.globalAlpha =  a - 0.2;
                cctx.fillRect(x * sz, y * sz, psize, psize);
            }
        }
    }
    
    var ctexture = new THREE.TextureLoader().load(ccanvas.toDataURL());
    ctexture.wrapS = THREE.RepeatWrapping;
    ctexture.wrapT = THREE.RepeatWrapping;
    ctexture.repeat.set(1, 2);
    if(!debugTexutures) ccanvas.style.display = "none";   

    var cobj = new THREE.Mesh( 
        new THREE.SphereGeometry(30.5 + (i/4), 50, 50), 
        new THREE.MeshLambertMaterial( {
            color: 0xffffff, 
            map: ctexture, 
            transparent: true
        }) 
    );
    scene.add( cobj );

    clouds.push(cobj);
}




//////////////////////////////////////////skybox/////////////////////////////////////
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
    var starsize = Math.random() * 5;
    skyctx.fillRect(
        Math.random() * skysz, 
        Math.random() * skysz, 
        starsize,
        starsize
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
    obj.rotation.y += 0.005;
    wobj.rotation.y += 0.005;
    tobj.rotation.y += 0.005;

    for(var i = 0; i < clouds.length; i++){
        clouds[i].rotation.y += 0.005 + 2*i/1000;
    }
    
    controls.update();
    renderer.render(scene, camera);
};

animate();