//variable declaration section
let dirLight, hemiLight, spotLight;
var mapTexture = THREE.ImageUtils.loadTexture('img/metal.jpg');
let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null
let ballObject = null, moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
let kObject = null, kMoveDirection = { left: 0, right: 0, forward: 0, back: 0 }, tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion();
let TObject = null, tMoveDirection = { left: 0, right: 0, forward: 0, back: 0 }
let ammoTmpPos = null, ammoTmpQuat = null;
let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();

var ball;
var lightCount = 3;

const STATE = { DISABLE_DEACTIVATION: 4 }

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }


//Ammojs Initialization
Ammo().then(start)

function start() {

    tmpTrans = new Ammo.btTransform();
    ammoTmpPos = new Ammo.btVector3();
    ammoTmpQuat = new Ammo.btQuaternion();

    setupPhysicsWorld();
    setupGraphics();

    createMap();
    createTimer();

    renderFrame();

}

function lightOff() {

    scene.remove(dirLight);
    scene.remove(hemiLight);
}

function lightUp() {

    //Add hemisphere light
    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.color.setHSL(0.6, 0.6, 0.6);
    hemiLight.groundColor.setHSL(0.1, 1, 0.4);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    //Add directional light
    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(100);
    scene.add(dirLight);


    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    let d = 350;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;

    dirLight.shadow.camera.far = 13500;

}

function setupPhysicsWorld() {

    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));

}

function setupGraphics() {

    var container = document.createElement('div');
    document.body.appendChild(container);

    // var info = document.createElement('div');
    var timer = document.createElement('div');
    var timerSec = document.createElement('div');
    var overlay = document.createElement('div');

    var hint = document.createElement('div');

    //hint
    hint.innerHTML = '<div id = "hint"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>'
    hint.style.fontSize = '3em';
    hint.style.position = 'absolute';
    hint.style.color = 'white';
    hint.style.top = '90%';
    hint.style.textAlign = 'center';
    hint.style.marginRight = "10%";
    hint.style.width = '100%';
    container.appendChild(hint);

    timer.style.position = 'absolute';
    timer.style.color = 'white';
    timer.style.top = '10%';
    timer.style.textAlign = 'center';
    timer.style.width = '100%';
    timer.innerHTML = '<div id = "timer"></div>'

    timerSec.style.cssFloat = "left";
    timerSec.style.width = "25%";
    timerSec.style.fontSize = "5em";
    timerSec.style.textAlign = 'center';

    container.appendChild(timer);
    timer.appendChild(timerSec);

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = THREE.ImageUtils.loadTexture("img/universe.jpg");

    //create camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    camera.position.set(0, 500, 150);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //Setup the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;



}


function renderFrame() {

    let deltaTime = clock.getDelta();

    updatePhysics(deltaTime);

    renderer.render(scene, camera);

    requestAnimationFrame(renderFrame);

}


function createBall() {

    let pos = { x: -185, y: 4, z: -175 };
    let radius = 6;
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;

    //threeJS Section
    var geometry = new THREE.SphereBufferGeometry(radius);
    var material = new THREE.MeshPhongMaterial();
    ball = new THREE.Mesh(geometry, material);

    material.map = THREE.ImageUtils.loadTexture("img/earth.jpg");

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btSphereShape(radius);
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(1);
    body.setRollingFriction(10);
    body.setLinearVelocity(0.0, 0.0, 0.0);

    body.setActivationState(STATE.DISABLE_DEACTIVATION)

    physicsWorld.addRigidBody(body);

    ball.userData.physicsBody = body;
    rigidBodies.push(ball);

    spotLight = new THREE.SpotLight(0xffffff),
    spotLightHelper = new THREE.SpotLightHelper(spotLight);

    // additional spotlight properties of interest
    spotLight.intensity = 2;
    spotLight.penumbra = .5;
    spotLight.angle = Math.PI / 35;

    scene.add(spotLight);
    scene.add(spotLight.target);

    // when changing the spotlight position
    // or target I will want to update the helper
    spotLight.position.set(ball.position.x, ball.position.y + 100, ball.position.z);
    spotLight.target.position.set(pos.x, pos.y, pos.z);


    return ball;

}


function createTransparentKinematicBox(a, b, c, sa, sb, sc) {

    var group = new THREE.Group();

    let pos = { x: a, y: b, z: c };
    let scale = { x: sa, y: sb, z: sc };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;

    //threeJS Section
    kObject = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({ color: 0x30ab78, transparent: true, opacity: 0 }));

    kObject.position.set(pos.x, pos.y, pos.z);
    kObject.scale.set(scale.x, scale.y, scale.z);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);


    physicsWorld.addRigidBody(body);
    kObject.userData.physicsBody = body;


    return kObject;



}

function createKinematicBox(a, b, c, sa, sb, sc) {

    var group = new THREE.Group();

    let pos = { x: a, y: b, z: c };
    let scale = { x: sa, y: sb, z: sc };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;

    //threeJS Section
    var geometry = new THREE.BoxBufferGeometry();
    var material = new THREE.MeshPhongMaterial();
    var kObject = new THREE.Mesh(geometry, material);

    material.map = THREE.ImageUtils.loadTexture("img/metal.jpg");

    kObject.position.set(pos.x, pos.y, pos.z);
    kObject.scale.set(scale.x, scale.y, scale.z);

    kObject.castShadow = true;
    kObject.receiveShadow = true;

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    body.setActivationState(STATE.DISABLE_DEACTIVATION);
    body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);


    physicsWorld.addRigidBody(body);
    kObject.userData.physicsBody = body;


    return kObject;


}


function createTimer() {

    var count = 0;

    var x = setInterval(function () {

        var countDownDate = 180000;

        var time = countDownDate - count * 1000;

        var minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((time % (1000 * 60)) / 1000);
       

        if (minutes < 10 && seconds < 10) {
            document.getElementById("timer").innerHTML = "<h1>Traball</h1><div class ='timerSec'>" +
                "0" + minutes + " :" + "   " + "0" + seconds + '</div></div>';
        }
        else if (minutes < 10) {
            document.getElementById("timer").innerHTML = "<h1>Traball</h1><div class ='timerSec'>" +
                "0" + minutes + " :" + "   " + seconds + '</div></div>';
        }
        else if (seconds < 10) {
            document.getElementById("timer").innerHTML = "<h1>Traball</h1><div class ='timerSec'>" +
                minutes + " :" + "   " + "0" + seconds + '</div></div>';
        }

        if (time < 0) {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "<h1>Time Out!</h1>";
            $("#layerPopup").show();
        }
        else {
            count = count + 1;
        }
    }, 1000);
}



function createMap() {

    var group = new THREE.Group();

    var block = createKinematicBox(-200, 5, 0, 10, 10, 400);
    group.add(block);
    block = createKinematicBox(200, 5, 0, 10, 10, 400);
    group.add(block);
    block = createKinematicBox(-15, 5, 195, 360, 10, 10);
    group.add(block);
    block = createKinematicBox(0, 5, -195, 390, 10, 10);
    group.add(block);

    block = createKinematicBox(0, 0, 0, 400, 2, 400);
    group.add(block);

    //투명 뚜껑 만들기
    var top = createTransparentKinematicBox(0, 8, 0, 400, 2, 400);
    group.add(top);

    var ball = createBall();
    group.add(ball);


    //벽 만들기
    var block = createKinematicBox(-90, 5, -65, 10, 10, 60);
    group.add(block);


    var block = createKinematicBox(0, 5, -15, 10, 10, 20);
    group.add(block);

    block = createKinematicBox(15, 5, -30, 40, 10, 10);
    group.add(block);

    var block = createKinematicBox(30, 5, 0, 10, 10, 50);
    group.add(block);

    block = createKinematicBox(0, 5, 30, 70, 10, 10);
    group.add(block);

    var block = createKinematicBox(-30, 5, -15, 10, 10, 80);
    group.add(block);

    block = createKinematicBox(-35, 5, -60, 60, 10, 10);
    group.add(block);

    var block = createKinematicBox(0, 5, -75, 10, 10, 40);
    group.add(block);

    block = createKinematicBox(-45, 5, -90, 80, 10, 10);
    group.add(block);

    block = createKinematicBox(-75, 5, -30, 40, 10, 10);
    group.add(block);

    var block = createKinematicBox(-60, 5, 15, 10, 10, 80);
    group.add(block);

    block = createKinematicBox(-5, 5, 60, 120, 10, 10);
    group.add(block);

    block = createKinematicBox(60, 5, 0, 10, 10, 130);
    group.add(block);

    block = createKinematicBox(45, 5, -60, 20, 10, 10);
    group.add(block);

    block = createKinematicBox(-75, 5, 30, 20, 10, 10);
    group.add(block);


    block = createKinematicBox(-10, 5, 90, 210, 10, 10);
    group.add(block);

    block = createKinematicBox(105, 5, 60, 20, 10, 10);
    group.add(block);


    // 맵 복잡하게

    var block = createKinematicBox(-170, 5, -170, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(-150, 5, -155, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-130, 5, -140, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(-95, 5, -125, 60, 10, 10);
    group.add(block);

    var block = createKinematicBox(-100, 5, -170, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(-180, 5, -125, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-170, 5, -85, 10, 10, 70);
    group.add(block);
    //
    var block = createKinematicBox(-150, 5, -45, 50, 10, 10);
    group.add(block);

    var block = createKinematicBox(-150, 5, -95, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-115, 5, -100, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(-180, 5, 10, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-155, 5, -15, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-170, 5, 25, 10, 10, 20);
    group.add(block);

    block = createKinematicBox(-145, 5, 20, 10, 10, 60);
    group.add(block);

    var block = createKinematicBox(-145, 5, 55, 100, 10, 10);
    group.add(block);

    var block = createKinematicBox(-125, 5, 5, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-110, 5, 40, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(-120, 5, -35, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(-110, 5, 165, 10, 10, 50);
    group.add(block);

    var block = createKinematicBox(-185, 5, 150, 20, 10, 10);
    group.add(block);

    var block = createKinematicBox(-170, 5, 160, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(-150, 5, 170, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-105, 5, 135, 70, 10, 10);
    group.add(block);

    var block = createKinematicBox(-145, 5, 125, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(-165, 5, 115, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-180, 5, 85, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-120, 5, 100, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(-70, 5, 165, 40, 10, 10);
    group.add(block);

    var block = createKinematicBox(110, 5, 165, 90, 10, 10);
    group.add(block);

    var block = createKinematicBox(165, 5, 140, 60, 10, 10);
    group.add(block);

    var block = createKinematicBox(60, 5, 160, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(50, 5, 145, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(30, 5, 122.5, 10, 10, 55);
    group.add(block);

    var block = createKinematicBox(0, 5, 180, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(-10, 5, 165, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(-20, 5, 140, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(-5, 5, 115, 60, 10, 10);
    group.add(block);

    var block = createKinematicBox(-45, 5, 155, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(-65, 5, 180, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(-75, 5, 120, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(25, 5, 180, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(15, 5, 140, 20, 10, 10);
    group.add(block);

    var block = createKinematicBox(120, 5, 70, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(95, 5, 120, 40, 10, 10);
    group.add(block);

    var block = createKinematicBox(80, 5, 105, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(45, 5, 115, 20, 10, 10);
    group.add(block);

    var block = createKinematicBox(100, 5, 135, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(-30, 5, -155, 10, 10, 70);
    group.add(block);

    var block = createKinematicBox(-70, 5, -142.5, 10, 10, 25);
    group.add(block);

    var block = createKinematicBox(-65, 5, -160, 20, 10, 10);
    group.add(block);

    var block = createKinematicBox(-40, 5, -125, 10, 10, 10);
    group.add(block);

    var block = createKinematicBox(-0, 5, -110, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(5, 5, -130, 20, 10, 10);
    group.add(block);

    var block = createKinematicBox(20, 5, -140, 10, 10, 30);
    group.add(block);

    var block = createKinematicBox(-15, 5, -160, 20, 10, 10);
    group.add(block);

    var block = createKinematicBox(35, 5, -160, 40, 10, 10);
    group.add(block);

    var block = createKinematicBox(100, 5, -155, 10, 10, 70);
    group.add(block);

    var block = createKinematicBox(95, 5, -115, 70, 10, 10);
    group.add(block);

    var block = createKinematicBox(135, 5, -85, 40, 10, 10);
    group.add(block);

    var block = createKinematicBox(160, 5, -120, 10, 10, 80);
    group.add(block);

    var block = createKinematicBox(140, 5, -155, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(170, 5, -115, 10, 10, 10);
    group.add(block);

    var block = createKinematicBox(90, 5, -70, 10, 10, 80);
    group.add(block);

    var block = createKinematicBox(30, 5, -75, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(55, 5, -115, 10, 10, 40);
    group.add(block);

    var block = createKinematicBox(150, 5, 80, 10, 10, 50);
    group.add(block);

    var block = createKinematicBox(160, 5, 110, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(170, 5, 125, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(100, 5, -5, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(120, 5, 5, 10, 10, 100);
    group.add(block);

    var block = createKinematicBox(80, 5, 30, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(160, 5, -5, 70, 10, 10);
    group.add(block);

    var block = createKinematicBox(170, 5, -55, 50, 10, 10);
    group.add(block);

    var block = createKinematicBox(150, 5, -40, 10, 10, 20);
    group.add(block);

    var block = createKinematicBox(165, 5, 25, 30, 10, 10);
    group.add(block);

    var block = createKinematicBox(175, 5, 60, 10, 10, 60);
    group.add(block);

    var block = createKinematicBox(187.5, 5, 85, 15, 10, 10);
    group.add(block);

    var block = createKinematicBox(30, 5, 75, 10, 10, 20);
    group.add(block);


    scene.add(group);



    window.onkeydown = function (event) {
        ball.position.y = 0;
        spotLight.position.set(ball.position.x, 500, ball.position.z);

        spotLight.target.position.x = ball.position.x;
        spotLight.target.position.y = ball.position.y;
        spotLight.target.position.z = ball.position.z;

        if (event.keyCode == 37) { //좌
            if (group.rotation.z < 0.3) { group.rotation.z += 0.01; }
            physicsWorld.setGravity(new Ammo.btVector3(-40, 0, 0));
        } else if (event.keyCode == 38) {//상
            if (group.rotation.x > -0.1) {
                group.rotation.x -= 0.01;
            }
            physicsWorld.setGravity(new Ammo.btVector3(0, 0, -40));
        } else if (event.keyCode == 39) {//우
            if (group.rotation.z > -0.3) {
                group.rotation.z -= 0.01;
            }

            physicsWorld.setGravity(new Ammo.btVector3(40, 0, 0));
        } else if (event.keyCode == 40) {//하
            if (group.rotation.x < 0.1) {
                group.rotation.x += 0.01;
            }
            physicsWorld.setGravity(new Ammo.btVector3(0, 0, 40));
        }

        if (ball.position.z > 200) {
            $("#WinnerPopup").show();
        }
        if (event.keyCode == 13) { //엔터
            if (lightCount > 0) {
                lightUp();
                setTimeout(lightOff, 1000);
                lightCount--;

                if (lightCount == 1) {
                    document.getElementById("hint").innerHTML = ('<i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>');

                } else if (lightCount == 2) {
                    document.getElementById("hint").innerHTML = ('<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>');

                } else {
                    document.getElementById("hint").innerHTML = ('<i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>');
                }

            }
        }
    }
}


function updatePhysics(deltaTime) {

    // Step world
    physicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (let i = 0; i < rigidBodies.length; i++) {
        let objThree = rigidBodies[i];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if (ms) {

            ms.getWorldTransform(tmpTrans);
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

        }
    }

}
function close_window() {
    window.close();
}

function close_window() {
    window.close();

}