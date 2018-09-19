var renderer = null,
scene = null,
camera = null,
root = null,
gun = null,
monster = null,
group = null,
orbitControls = null;

var objLoader = null, jsonLoader = null;

var duration = 20000; // ms
var currentTime = Date.now();

function loadJson() {
  if(!jsonLoader)
  jsonLoader = new THREE.JSONLoader();

  jsonLoader.load(
    './models/monster/monster.js',

    function(geometry, materials)
    {
      var material = materials[0];

      var object = new THREE.Mesh(geometry, material);
      object.castShadow = true;
      object. receiveShadow = true;
      object.scale.set(0.002, 0.002, 0.002);
      object.position.set(0,-4,0);
      monster = object;
      object.rotation.y += Math.PI / 2;
      setAnimation(object);
      scene.add(object);
    },
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
}

function animate() {
  var now = Date.now();
  var deltat = now - currentTime;
  currentTime = now;
  var fract = deltat / duration;
  var angle = Math.PI * 2 * fract;
}

function run() {
  requestAnimationFrame(function() { run(); });
  // Render the scene
  renderer.render( scene, camera );
  KF.update();
  // Update the camera controller
  orbitControls.update();
}

function makeShape(start_angle, finish_angle, nTrian, radius) {
  if (nTrian == 1) verts[1] = radius/2;

  step = (finish_angle - start_angle)/nTrian
  points = []
  angles = [];
  values = [];

  for (var i = start_angle; i <= finish_angle; i+= step) {
    angles.push({y:-(toRadians(i)+ Math.PI / 2 )})
    values.push({x: cos(i)*radius, z: sin(i)*radius})
  }

  return {values,angles};
}

function setAnimation(object) {
  crateAnimator = new KF.KeyFrameAnimator;

  var shape = makeShape(0, 360, 4, 5);
  values = shape.values;
  angles = shape.angles

  crateAnimator.init({
    interps:
    [
      {
        keys: [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        values: values,
        target: object.position
      },
      {
        keys: [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        values: angles,
        target: object.rotation
      }
    ],
    loop: true,
    duration:10000,
  });
  crateAnimator.start();
}

function cos(angle) {
  return Math.cos(toRadians(angle));
}

function sin(angle) {
  return Math.sin(toRadians(angle));
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "./images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);

  // Turn on shadows
  renderer.shadowMap.enabled = true;
  // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
  camera.position.set(-2, 6, 12);
  scene.add(camera);

  // Create a group to hold all the objects
  root = new THREE.Object3D;

  // Add a directional light to show off the object
  directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

  // Create and add all the lights
  directionalLight.position.set(.5, 0, 3);
  root.add(directionalLight);

  spotLight = new THREE.SpotLight (0xffffff);
  spotLight.position.set(2, 8, 15);
  spotLight.target.position.set(-2, 0, -2);
  root.add(spotLight);

  spotLight.castShadow = true;

  spotLight.shadow.camera.near = 1;
  spotLight.shadow. camera.far = 200;
  spotLight.shadow.camera.fov = 45;

  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

  ambientLight = new THREE.AmbientLight ( 0x888888 );
  root.add(ambientLight);

  // Create the objects
  loadJson();

  // Create a group to hold the objects
  group = new THREE.Object3D;
  root.add(group);

  // Create a texture map
  var map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  var color = 0xffffff;

  // Put in a ground plane to show off the lighting
  geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -4.02;

  // Add the mesh to our group
  group.add( mesh );
  mesh.castShadow = false;
  mesh.receiveShadow = true;

  // Now add the group to our scene
  scene.add( root );
}
