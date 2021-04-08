let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    let cameraset  = false ;
    

    engine.runRenderLoop(() => {
    let deltaTime = engine.getDeltaTime(); // remind you something ?

    let rabbit = scene.getMeshByName("Rabbit");
    if (rabbit){
        if (!cameraset){
            let followCamera = createFollowCamera(scene, rabbit);
            scene.activeCamera = followCamera;
            cameraset = true;
        }
        rabbit.move();
    } 
    scene.render();   
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);


    let rabbit = createRabbit(scene);
   
    createLights(scene);

   return scene;
}

function createGround(scene) {
    const groundOptions = { width:2000, height:2000, subdivisions:20, minHeight:0, maxHeight:100, onReady: onGroundCreated};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", "images/hmap1.png", groundOptions, scene); 

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/grass.jpg");
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);

}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 50; // how far from the object to follow
	camera.heightOffset = 20; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

let zMovement = 5;

function createRabbit(scene){
    BABYLON.SceneLoader.ImportMesh("Rabbit", "models/Rabbit/", "Rabbit.babylon", scene, (newMeshes, particleSystems, skeletons) => {
        let rabbit = newMeshes[0];

        rabbit.position = new BABYLON.Vector3(0,0,0);
        rabbit.scaling = new BABYLON.Vector3(0.2,0.2,0.2);
        rabbit.speed = 1;
        rabbit.frontVector = new BABYLON.Vector3(0, 0, -1);
        rabbit.rotation.y = Math.PI;

        let a = scene.beginAnimation(skeletons[0], 0, 72, true, 0.8);
        rabbit.move = () => {
            let yMovement = 0;
            if (rabbit.position.y > 2) {
                zMovement = 0;
                yMovement = -2;
            } 
            if(inputStates.up) {
                rabbit.moveWithCollisions(rabbit.frontVector.multiplyByFloats(rabbit.speed, rabbit.speed, rabbit.speed));
            }
            if(inputStates.down) {
                rabbit.moveWithCollisions(rabbit.frontVector.multiplyByFloats(-rabbit.speed, -rabbit.speed, -rabbit.speed));
            }    
            if(inputStates.left) {
                rabbit.rotation.y -= 0.02;
                rabbit.frontVector = new BABYLON.Vector3(Math.sin(rabbit.rotation.y), 0, Math.cos(rabbit.rotation.y));
            }    
            if(inputStates.right) {
                rabbit.rotation.y += 0.02;
                rabbit.frontVector = new BABYLON.Vector3(Math.sin(rabbit.rotation.y), 0, Math.cos(rabbit.rotation.y));
            }
            if(inputStates.Shift)
                rabbit.speed = 2;
            else
                rabbit.speed = 1;
    }
    });
}
window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the rabbit
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    inputStates.Shift = false;


    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = true;
        } else if (event.key === " ") {
           inputStates.space = true;
        } else if (event.key === "Shift") {
            inputStates.Shift = true;
        }
    
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
           inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
           inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
           inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
           inputStates.down = false;
        } else if (event.key === " ") {
           inputStates.space = false;
        } else if (event.key === "Shift") {
            inputStates.Shift = false;
        }
    }, false);
}

