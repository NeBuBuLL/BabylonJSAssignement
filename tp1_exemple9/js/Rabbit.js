export default class Rabbit {
    constructor(rabbitMesh, speed) {
        this.rabbitMesh = rabbitMesh;

        if(speed)
            this.speed = speed;
        else
            this.speed = 1;

        // in case, attach the instance to the mesh itself, in case we need to retrieve
        // it after a scene.getMeshByName that would return the Mesh
        // SEE IN RENDER LOOP !
        rabbitMesh.Rabbit = this;
    }

    move(scene) {
        if (rabbitMesh.Rabbit.position == 0){
            console.log("Y = 0");
        }
    }
}