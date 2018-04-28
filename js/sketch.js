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

////////////////////body//////////////////////////
var planet = new Planet(canvasSize, pScale);

//////////////////////////////////////////skybox/////////////////////////////////////
newNoiseResource();
var skycanvas = document.createElement('canvas');
document.body.appendChild(skycanvas);
var skysz = canvasSize;
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
    planet.setReflectionMap(textureCube);
});
scene.background = textureCube;
if(!debugTexutures) skycanvas.style.display = "none";


//document.body.appendChild( THREE.UVsDebug( geometry, 2048));

var animate = function () {
    stats.update();
    requestAnimationFrame( animate );
    planet.animate();

    controls.update();
    renderer.render(scene, camera);
};

animate();