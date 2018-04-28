function Planet(sz, psize){

    /*
        getLayer -designed to reduce the repetitive nature of creating a sphere layer from a new canvas
        -creates a canvas, adds it to document
        -callback for initial setup (ctx colors, styles, etc),
        -callback for noise action (each x, y)
            -do rounding for 'a' (makes flat noise layers)
            -pass ctx, x, y, a
        -create THREE texture from canvas, do wrapping/mirroring
        -handle debugTextures
    */
    function getLayer(initCallback, drawCallback, rx, ry, doround=true, scale=1){
        newNoiseResource();
    
        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = sz;
        canvas.height = sz;
        var ctx = canvas.getContext('2d');
        
        //do initial stuff
        initCallback(canvas, ctx);
    
        for(var x = 0; x < 1; x += psize/sz){
            for(var y = 0; y < 1; y += psize/sz){
                var a = fetchTileableNoise(x, y, scale);
                if(doround){
                    a = Math.floor(a * 5)/10 + 0.2;
                }
                drawCallback(ctx, x, y, a);
            }
        }
        
        var texture = new THREE.TextureLoader().load(canvas.toDataURL());
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(rx, ry);
        if(!debugTexutures) canvas.style.display = "none";   
    
        return texture;
    }

    var obj = new THREE.Mesh( 
                new THREE.SphereGeometry(30, 50, 50),
                new THREE.MeshLambertMaterial( 
                    {
                        color: 0xffffff, 
                        map:getLayer(
                            (canvas, ctx) => { //init callback
                                ctx.fillStyle = getRandomColor();
                                ctx.fillRect(0, 0, sz, sz);
                                ctx.fillStyle = getRandomColor();
                            },
                            (ctx, x, y, a) => { //noise action callback
                                ctx.globalAlpha = a;
                                ctx.fillRect(x * sz, y * sz, psize, psize);
                            },
                            2, 1)
                    })
            );
    scene.add( obj );

    var lcanvas = document.createElement('canvas');
    document.body.appendChild(lcanvas);
    var lctx = lcanvas.getContext('2d');

    var scale = Number(Math.random().toFixed(1)) + 0.2;
    if(scale > 1) scale = 1;

    var wobj = new THREE.Mesh( 
        new THREE.SphereGeometry(30.01, 50, 50),
        new THREE.MeshPhongMaterial( 
            {
                color: 0xffffff, 
                map:getLayer(
                    function(canvas, ctx){
                        ctx.fillStyle = getRandomColor();

                        lcanvas.width = sz;
                        lcanvas.height = sz;
                        lctx.fillStyle = "white";
                        lctx.strokeStyle = "white";
                    },
                    function(ctx, x, y, a){
                        if(a <= 0.6){
                            
                            //luck1, 20% chance to pass
                            if(flipCoin(0.93)) return;

                            //factors for a city: distance to equator, distance to coast, 2 random chances (first already passed)
                            var equator = 1 - Math.abs(y - 0.5)*2; //distance to equator (0-1)
                            var coast = a/0.6; //distance to coast (0-1)
                            var luck2 = Math.random(); //random (0-1)
                            
                            //lazy average must be 0.7
                            if(equator + coast*2.5 + luck2 > 0.7 * 4.5) {
            
                                lctx.globalAlpha = Math.random(); 
            
                                lctx.fillRect( x*sz - psize/2, y*sz, Math.random() * psize, Math.random() * psize);
                                lctx.fillRect( x*sz - psize/2, y*sz - psize/2, Math.random() * psize, Math.random() * psize);
                                lctx.fillRect( x*sz, y*sz - psize/2, Math.random() * psize, Math.random() * psize);
                                lctx.fillRect( x*sz, y*sz, randomVariationRange(psize, 0, 2), randomVariationRange(psize, 0, 2));
                                
                                if(flipCoin(0.25)){
                                    for(var i = randomRange(1, 8); i >= 0; i--){
                                        var ex = (x*sz + psize*randomRange(-12, 12))/sz;
                                        var ey = (y*sz + psize*randomRange(-12, 12))/sz;
                                        if(
                                            fetchTileableNoise(ex, ey, scale) <= 0.6 &&
                                            fetchTileableNoise((ex + x)/2, (ey + y)/2, scale) <= 0.6) {

                                                lctx.globalAlpha -= 0.2;
                                                lctx.beginPath();

                                                lctx.moveTo(x*sz, y*sz);
                                                lctx.bezierCurveTo(
                                                    randomRange(x*sz, ex*sz), 
                                                    randomRange(y*sz, ey*sz), 
                                                    randomRange(x*sz, ex*sz), 
                                                    randomRange(y*sz, ey*sz), 
                                                    ex*sz, 
                                                    ey*sz);

                                                lctx.stroke();
                                        }
                                    }
                                }
                            }
                        }
                        else if( a > 0.6){
                            a = Math.floor(a * 5)/10;
                            ctx.globalAlpha = a + 0.3;
                            ctx.fillRect(x * sz, y * sz, psize, psize);
                        }
                    },
                    3, 1,
                    false,
                    scale
                ),
                combine: THREE.MixOperation,
                reflectivity: 0.5,
                transparent: true,
                shininess: 100
            })
    );
    scene.add( wobj );

    var ltexture = new THREE.TextureLoader().load(lcanvas.toDataURL());
    ltexture.wrapS = THREE.RepeatWrapping;
    ltexture.wrapT = THREE.RepeatWrapping;
    ltexture.repeat.set(3, 1);
    if(!debugTexutures) lcanvas.style.display = "none";

    var lobj = new THREE.Mesh(
        new THREE.SphereGeometry(30.01, 50, 50),
        new THREE.MeshBasicMaterial( {
            transparent: true,
            map: ltexture,
            color: assembleHSB(Math.random() * 360, 100, 80)
        })
    );
    scene.add(lobj);


    /////////////////////////////////Clouds///////////////////////////
    var clouds = [];
    var h = Math.random() * 360;
    for(var i = 0; i < 3; i++){

        var cobj = new THREE.Mesh( 
            new THREE.SphereGeometry(30.5 + (i/4), 50, 50),
            new THREE.MeshLambertMaterial( 
                {
                    color: 0xffffff, 
                    transparent: true,
                    map:getLayer(
                        (canvas, ctx) => {
                            ctx.strokeStyle = "rgba(0, 0, 0, 0)";
                            ctx.fillStyle = assembleHSB(h, 80, 60 + i*20); 
                        },
                        (ctx, x, y, a) => {
                            if(a > 0.4){
                                ctx.globalAlpha =  a - 0.2;
                                ctx.fillRect(x * sz, y * sz, psize, psize);
                            }
                        },
                        1, 2,
                        true,
                        //.4, .5, .6
                        0.4 + (i*0.1) //changes size of clouds
                    ),

                })
        );
        scene.add( cobj );
        clouds.push(cobj);
    }

    this.setReflectionMap = function(textureCube){
        wobj.material.envMap = textureCube;
        wobj.material.needsUpdate = true;
    };

    this.animate = function(){
        //obj.rotation.x += 0.01;
        obj.rotation.y += 0.005;
        wobj.rotation.y += 0.005;
        lobj.rotation.y += 0.005;

        for(var i = 0; i < clouds.length; i++){
            clouds[i].rotation.y += 0.005 + 2*i/1000;
        }
    };
}

