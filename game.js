var scene;
var camera;
var renderer;
var cube;

window.onload = function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xEEEEEE);
    renderer.setSize(500, 500);
    //Show Axis
    var axes = new THREE.AxisHelper(10);
    scene.add(axes);
    //Let's make a plane
    var planeGeometry = new THREE.PlaneGeometry(60,30,1,1);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xEEEEEE});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    scene.add(plane);

    camera.position.x = 0;
    camera.position.y =30;
    camera.position.z = 18;
    camera.lookAt(scene.position);
    document.getElementById("threejs_scene").appendChild(renderer.domElement);

    var cubeGeometry = new THREE.CubeGeometry(15,5,20);  
    var cubeMaterials = [ 
        new THREE.MeshBasicMaterial({color:0x0089A0, transparent:true, opacity:0.8, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0x0089A0, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x0089A0, transparent:true, opacity:0.8, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0x0089A0, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x0089A0, transparent:true, opacity:0, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x0089A0, transparent:true, opacity:0.8, side: THREE.DoubleSide}), 
    ]; 
    // Create a MeshFaceMaterial, which allows the cube to have different materials on each face 
    var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    scene.add( cube );
    cube.position.x = 0;  
    cube.position.y = 10;  
    cube.position.z = 10;  
    scene.add(cube);


    //Let's make a sphere
    var sphereGeometry = new THREE.SphereGeometry(1,32,32);
    var sphereMeterial = new THREE.MeshBasicMaterial({color: 0xFE98A0});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMeterial);
    sphere.position.x = 0;
    sphere.position.y = 13;
    sphere.position.z = 10;
    scene.add(sphere);


    renderScene();
    
    function renderScene() {
    
    renderer.render(scene,camera);
    requestAnimationFrame(renderScene); 
    //cube animation    

    window.onkeydown=function(event){

        if(event.keyCode == 37){ //좌
            cube.rotation.y += 0.01;
            sphere.position.x-=0.1;
            sphere.position.z+=0.1;
        }else if(event.keyCode == 38){//상
            cube.rotation.x -= 0.01; 
            sphere.position.z-=0.1;
        } else if(event.keyCode == 39){//우
            cube.rotation.y -= 0.01; 
            sphere.position.x+=0.1;
            sphere.position.z+=0.1;
        }else if(event.keyCode == 40){//하
            cube.rotation.x += 0.01; 
            sphere.position.z+=0.1;
        }

        // gl.uniform4f(uOffset,xOffset,yOffset,0,0);

    }
}
}

