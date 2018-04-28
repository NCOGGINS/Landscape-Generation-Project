var land;
var sea;
var textures;
var paused = true;
var tau = Math.PI * 2;
var plRotx, plRoty, plRotz;
var celestialObj = 2; //between 1 and 3, inclusive

function main() {
    initialize();
    draw();
    //setInterval(cycle, 100);
}

function cycle() {
    sea.cycle(0.1, 0);
    sea.maptoArray();
    console.log("loop");
    draw();
}

function initialize() {
    var lwSize = document.getElementById("lwSize").value;
    var mapSize = document.getElementById("mapSize").value;
    var landHeight = document.getElementById("landHeight").value;
    var waterHeight = document.getElementById("waterHeight").value;
    var waterSkew = document.getElementById("waterSkew").value;
    var windDir = document.getElementById("windDir").value;

    land = new Landscape(65, 3, 1.25, 0.2);
    sea = new Water(65, 0.1, 0.01, 0.2, Math.PI / 2);
    weather = new Weather(0.1);
    textures = new GenTextures();

    weather.generate();
    land.generate();
    sea.generate();
    sea.maptoArray();

    plRotx = Math.PI/4000 * Math.random() - Math.PI/8000;
    plRoty = Math.PI/4000 * Math.random() - Math.PI/8000;
    plRotz = Math.PI/4000 * Math.random() - Math.PI/8000;
}

function draw() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1.0, 0.1, 1000);

    //set render to canvas Element
    var renderer = new THREE.WebGLRenderer({canvas: drawCanvas});
    renderer.setSize(drawCanvas.width, drawCanvas.height);
    renderer.shadowMap.enabled = true;

    var skySphereGeometry = new THREE.SphereGeometry(11, 20, 20);  //radius, width segments, height segments
    var skyMaterial = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: textures.generateSky()});
    var skySphere = new THREE.Mesh(skySphereGeometry, skyMaterial);
    skySphere.position.x = 0;
    skySphere.position.y = 0;
    skySphere.position.z = 0;
    scene.add(skySphere);

    var spriteMaterial = [];
    var sprite = [];
    for (var i = 0; i < celestialObj; i++) {
      spriteMaterial[i] = new THREE.SpriteMaterial({map: textures.generatePlanet(i, Math.random() * 300, Math.random() * 55)});
      sprite[i] = new THREE.Sprite(spriteMaterial[i]);
      var theta = Math.random() * tau;
      sprite[i].position.x = 9 * Math.sin(theta);
      sprite[i].position.y = 9 * Math.cos(theta);
      sprite[i].position.z = -9;
      //might conflict with other z positions
      //TODO figure out how to map to spherical coordinates because it seems this is not how to do it
      scene.add(sprite[i]);
    }

    //turn off for night
    // var daySphereGeometry = new THREE.SphereGeometry(10, 20, 20);  //radius, width segments, height segments
    // var dayMaterial = new THREE.MeshBasicMaterial({color: 0x8888FF, side: THREE.DoubleSide, transparent: true, opacity: 1, depthWrite: false});
    // var daySphere = new THREE.Mesh(daySphereGeometry, dayMaterial);
    // skySphere.position.x = 0;
    // skySphere.position.y = 0;
    // skySphere.position.z = 0;
    // scene.add(daySphere);
    //
    // var atmoSphereGeometry = new THREE.SphereGeometry(8, 20, 20);  //radius, width segments, height segments
    // var atmoMaterial = new THREE.MeshBasicMaterial({color: 0x8888FF, side: THREE.DoubleSide, transparent: true, opacity: 0.7, depthWrite: false});
    // var atmoSphere = new THREE.Mesh(atmoSphereGeometry, atmoMaterial);
    // skySphere.position.x = 0;
    // skySphere.position.y = 0;
    // skySphere.position.z = 0;
    // scene.add(atmoSphere);

    var landGeometry = new THREE.Geometry();
    landGeometry.vertices = land.getVertices;
    landGeometry.faces = land.getFaces;
    landGeometry.computeFaceNormals();

    var seaGeometry = new THREE.Geometry();
    seaGeometry.vertices = sea.getVertices;
    seaGeometry.faces = sea.getFaces;
    seaGeometry.computeFaceNormals();

    var diffuseColor = new THREE.Color(0.6, 0.5, 0.4);
    var specularColor = new THREE.Color(1.0, 1.0, 1.0);
    var landMaterial = new THREE.MeshLambertMaterial({
        color: diffuseColor,
        specular: specularColor,
        reflectivity: 0.001,
        shadowSide: THREE.BackSide
    });

    var diffuseColor = new THREE.Color(0.05, 0.25, 0.5);
    var specularColor = new THREE.Color(1.0, 1.0, 1.0);
    var seaMaterial = new THREE.MeshPhongMaterial({
        color: diffuseColor,
        specular: specularColor,
        reflectivity: 0.01,
        shininess: 0.15,
        shadowSide: THREE.BackSide,
        transparent: true,
        opacity: 0.6
    });

    var seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
    seaMesh.position.x = 0;
    seaMesh.position.y = -2.3
    seaMesh.position.z = 0;
    seaMesh.rotation.x = Math.PI / 2;
    scene.add(seaMesh);

    var landMesh = new THREE.Mesh(landGeometry, landMaterial);
    landMesh.position.x = 0;
    landMesh.position.y = -1;
    landMesh.position.z = 0;
    landMesh.rotation.x = Math.PI / 2;
    scene.add(landMesh);

    for (var i = 0; i < weather.meshArray.length; i++) {
        scene.add(weather.meshArray[i]);
    }

    camera.position.z = 3;

    scene.add(new THREE.AmbientLight(0x222222));
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-5, 100, 100).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

//    var plantsIndex = 0;
//    var plantObjectsIndex = 0;
//    var plantsObjectFacesIndex = 0;
//    var colorsIndex = 0;
//
//    var plantsLength = plants.length; //will be whatever array name is used
//    var objectsLength = plantObjects.length; //will be whatever array name is used
//    var facesLength = faces.length; //will be whatever array name is used
//    var colorsLength = colors.length; //will be whatever array name is used
//
//
////still needs the vertices to be added
//
////var vertices = new Float32Array( [
////	-1.0, -1.0,  1.0,
////	 1.0, -1.0,  1.0,
////	 1.0,  1.0,  1.0,
////
////	 1.0,  1.0,  1.0,
////	-1.0,  1.0,  1.0,
////	-1.0, -1.0,  1.0
////] );
////
////// itemSize = 3 because there are 3 values (components) per vertex
////geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
////
//
//    for (plantsIndex; plantsIndex < plantsLength; plantsIndex++) {
//        for (plantObjectsIndex; plantObjectsIndex < objectsLength; plantObjectsIndex++) {
//            var plantColor = new THREE.MeshBasicMaterial({color: colors[plantObjectsIndex]});
//            plant = new Three.BufferGeometry();
//            for (plantsObjectFacesIndex; plantsObjectFacesIndex < facesLength; plantsObjectFacesIndex++) {
//                plant.faces.push(faces[plantsObjectFacesIndex]);
//            }
//            var plantObject = new THREE.Mesh(geometry, material);
//            scene.add(plantObject);
//        }
//    }

    var animate = function () {
      console.log(paused);
      if (!paused) {
        // seaMesh.geometry.dispose();
        // scene.remove(seaMesh);
        // sea.cycle(0.1, 0);
        // sea.maptoArray();
        // seaGeometry = new THREE.Geometry();
        // seaGeometry.vertices = sea.getVertices;
        // seaGeometry.faces = sea.getFaces;
        // seaGeometry.computeFaceNormals();
        // seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
        // seaMesh.position.x = 0;
        // seaMesh.position.y = -0.5;
        // seaMesh.position.z = 0;
        // seaMesh.rotation.x = Math.PI / 1.8;
        // scene.add(seaMesh);
        skySphere.rotation.x += plRotx;
        skySphere.rotation.y += plRoty;
        skySphere.rotation.z += plRotz;
        render();
      }
    };

    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
        setTimeout(animate, 200);
    };
    render();
}

function switchPause() {
  paused = !paused;
  if (paused) {
    document.getElementById('pauseButton').innerText = "Unpause";
  } else {
    document.getElementById('pauseButton').innerText = "Pause";
  }
}
