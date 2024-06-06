import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

class BasicWorldDemo {
    mvtSpeed = 0.05;
    waypointAreaSize = 200; // Size of the area where waypoints can spawn
    averageHeight = 15; // Average height of the giraffes
    heightVariance = 3; // Variance for giraffe heights
    leafObjects = [];
    updateInterval = 10000; // 30 seconds in milliseconds
    updateTimer = null;
    generation = 1;
    counterDisplay = document.getElementById('counter');
    counter = 10;
    button1State = true;
    button2State = true;
    button3State = true;

    constructor() {
        this._Initialize();
        this._update = this._update.bind(this);
        this._startUpdateTimer();
        this._giraffes = [];
        this._waypoints = [];
        this._incrementCounter = this._incrementCounter.bind(this);
        setInterval(this._incrementCounter, 10);

    }

    _Initialize() {
        const beginButton = document.getElementById("begin");
        beginButton.addEventListener("click", () => {
            // Start the simulation when the "begin" div is clicked
            this._startSimulation();
            document.getElementById('begin').style.zIndex = -50;
        });
        this._threejs = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        document.addEventListener('keydown', (event) => this._OnKeyDown(event), false);
        document.addEventListener('keyup', (event) => this._OnKeyUp(event), false);
        document.body.appendChild(this._threejs.domElement);
    
        window.addEventListener('resize', () => {
            this._OnWindowResize();
        }, false);
    
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 10000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 70, 300);
    
        this._scene = new THREE.Scene();
    
        this._controls = new OrbitControls(this._camera, this._threejs.domElement);
        this._controls.target.set(0, 20, 0); // Set the orbit control target
    
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);
    
        light = new THREE.AmbientLight(0x707070);
        this._scene.add(light);
    
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200, 10, 10), // Increased size
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            })
        );
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);
        const posDiv = document.getElementById('pos');
        if (posDiv) {
            posDiv.addEventListener('click', () => {
                this._restartScene();
            });
        }
        document.getElementById('button1').addEventListener('click', () => {
            if (this.button1State) {
                this.button1State = false;
                document.getElementById('button1').style.backgroundColor = "red";
                document.getElementById('button1').textContent = "Disabled";
            }
            else {
                this.button1State = true;
                document.getElementById('button1').style.backgroundColor = "green";
                document.getElementById('button1').textContent = "Enabled";
            }
            console.log(this.button1State);
        });
        document.getElementById('button2').addEventListener('click', () => {
            if (this.button2State) {
                this.button2State = false;
                document.getElementById('button2').style.backgroundColor = "red";
                document.getElementById('button2').textContent = "Disabled";
            }
            else {
                this.button2State = true;
                document.getElementById('button2').style.backgroundColor = "green";
                document.getElementById('button2').textContent = "Enabled";
            }
        });
        document.getElementById('button3').addEventListener('click', () => {
            if (this.button3State) {
                this.button3State = false;
                document.getElementById('button3').style.backgroundColor = "red";
                document.getElementById('button3').textContent = "Disabled";
            }
            else {
                this.button3State = true;
                document.getElementById('button3').style.backgroundColor = "green";
                document.getElementById('button3').textContent = "Enabled";
            }
        });
        this._createTrees(7);
        this._createGiraffes(10);
        this._RAF();
        
    }
    
    _startSimulation() {
        this._scene = new THREE.Scene();
    
        this._controls = new OrbitControls(this._camera, this._threejs.domElement);
        this._controls.target.set(0, 20, 0); // Set the orbit control target
    
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = false;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this._scene.add(light);
    
        light = new THREE.AmbientLight(0x707070);
        this._scene.add(light);
    
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200, 10, 10), // Increased size
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            })
        );
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane); // Add the plane to the scene
    
        this._createTrees(7);
        this._createGiraffes(10);
        this._RAF();
    }
    
    

    

    _incrementCounter() {
        this.counter -= 0.01;

        if (this.counter <= 0) {
        this.counter = 10;
        this._restartScene();
        this._updateAverageHeight();

        }
        document.getElementById("counter").textContent = "Time Until Next Generation: "+ this.counter.toFixed(2);
    }

    _clearScene() {
        var children = this._scene.children;
        for (var i = 0; i < children.length; i++) {
            var obj = children[i];
            console.log("children: " + children);
            console.log(children.length);
            if (obj.userData.type === 'tree' || obj.userData.type === 'giraffe') {
                // Dispose of geometry and material
                if (obj.geometry) {
                    obj.geometry.dispose();
                }
                if (obj.material) {
                    // Dispose of textures in material
                    if (obj.material.map) {
                        obj.material.map.dispose();
                    }
                    obj.material.dispose();
                }
                console.log("object detected");
                // Remove object from the scene
                this._scene.remove(obj);
                // Since we removed an object, we need to adjust the index to stay on the current item in the next loop iteration
                i--;
            }
        }
    
        console.log("complete");
        // Clear arrays and collections after all objects are removed
        console.log("giraffe array before length: " + this._giraffes.length);
        console.log("leaf array before length: " + this.leafObjects.length);
        this._giraffes = [];
        this._waypoints = [];
        this.leafObjects = [];
        console.log("giraffe array after length: " + this._giraffes.length);
        console.log("leaf array after length: " + this.leafObjects.length);
    }
    
    

    
    

    _startUpdateTimer() {
        // this.updateTimer = setInterval(() => {
        //     this._restartScene();
        //     //this._updateTimeDisplay();
        // }, this.updateInterval);
    }

    _restartScene() {
        clearInterval(this.updateTimer);
        this._giraffes.forEach(giraffe => {
            giraffe.speed = 0; // Reset each giraffe's speed
            console.log(giraffe.speed);

        });
        this.counter = 10;
        // Clear the scene
        this._clearScene();
    
        // Add a delay before recreating the scene
        
            this._createTrees(7); // Recreate trees
            this._createGiraffes(10); // Recreate giraffes
            console.log("restarted");
    
            // Start update timer again
            this._startUpdateTimer();
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(200, 200, 10, 10), // Increased size
                new THREE.MeshStandardMaterial({
                    color: 0xFFFFFF,
                })
            );
            plane.castShadow = false;
            plane.receiveShadow = true;
            plane.rotation.x = -Math.PI / 2;
            this._scene.add(plane);
            this._updateAverageHeight();
            const heightDiv = document.getElementById('height');
            if (heightDiv) {
                heightDiv.textContent = `Current Average Height: ${this.averageHeight.toFixed(2)}`;
            }
            this.generation++;
            document.getElementById('generation').textContent = `Generation ${this.generation}`;
    }
    

    _updateAverageHeight() {
        if (this.button1State && this.button2State) {
            const randomAdjustment = Math.random() * (1.5) - 0.5; // Random number between -0.5 and 2
            this.averageHeight += randomAdjustment;
        }
        else if (!this.button1State) {
            
        }        
        else {
            const randomAdjustment = Math.random() * (2) - 1; // Random number between -0.5 and 2
            this.averageHeight += randomAdjustment;
        }
        
    }

    _checkCollisions() {
        
        // Iterate over each giraffe
        this._giraffes.forEach((giraffe, index) => {
            // Get the position of the giraffe
            const giraffePosition = giraffe.object.position;

            // Iterate over each leaf object
            for (let i = this.leafObjects.length - 1; i >= 0; i--) {
                const leafObj = this.leafObjects[i];
                const leaf = leafObj.object;

                // Calculate horizontal distance between giraffe and leaf
                const horizontalDistance = Math.sqrt(
                    Math.pow(leaf.position.x - giraffePosition.x, 2) +
                    Math.pow(leaf.position.z - giraffePosition.z, 2)
                );

                // Check if leaf is within the giraffe's reach horizontally and vertically
                if (horizontalDistance < 10 && leaf.position.y < giraffePosition.y + 30 + giraffe.height) {
                    // Change leaf color to red
                    leaf.material.color.set(0xff0000); // Red color

                    // Increment leaves eaten by this giraffe
                    giraffe.leavesEaten++;

                    // Remove leaf from scene
                    this._fadeLeaf(leaf);

                    // Remove leaf from leafObjects array
                    this.leafObjects.splice(i, 1);
                    
                    // Update the leaves eaten count in the corresponding div
                    
                }
            }
        });
    }


    _fadeLeaf(leaf) {
        // Example function to fade out the leaf over time
        leaf.material.transparent = true;
        leaf.material.opacity = 1.0;
        let opacity = 1.0;
        const fadeOutInterval = setInterval(() => {
            opacity -= 0.05; // Adjust fading speed as needed
            leaf.material.opacity = Math.max(opacity, 0);
            if (opacity <= 0) {
                clearInterval(fadeOutInterval);
                this._scene.remove(leaf); // Remove leaf from the scene
            }
        }, 100); // Interval duration in milliseconds
    }
    
    
    

    _updateGiraffes() {
        this._giraffes.forEach((giraffe, index) => {
            const { object, waypoints, currentWaypointIndex, speed } = giraffe;
            const currentWaypoint = waypoints[currentWaypointIndex];
            
            // Calculate direction towards current waypoint
            const dirX = currentWaypoint.x - object.position.x;
            const dirZ = currentWaypoint.z - object.position.z;
            const distance = Math.sqrt(dirX * dirX + dirZ * dirZ);
            
            // Point giraffe towards the current waypoint
            const targetAngle = Math.atan2(dirX, dirZ);
            object.rotation.y = targetAngle + Math.PI;
            
            // If giraffe is close to the current waypoint, switch to the next waypoint
            if (distance < 1) {
                giraffe.currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.length;
            } else {
                // Move towards the waypoint
                const delta = speed;
                object.position.x += dirX / distance * delta;
                object.position.z += dirZ / distance * delta;
            }
        });
    }

    _createGiraffes(numGiraffes) {
        const giraffeInfoContainer = document.getElementById("giraffeInfoContainer");
    
        for (let i = 0; i < numGiraffes; i++) {
            const loader = new GLTFLoader();
            const modelUrl = 'giraffe/source/model.gltf';
            loader.load(modelUrl, (gltf) => {
                // Generate height close to the average height with some variance
                
                var height = this.averageHeight;
                if (this.button1State) {
                    height += (Math.random() - 0.5) * this.heightVariance * 2;
                }
                const scale = height / 10; // Assuming 10 is the original height of the model
                gltf.scene.scale.set(scale, scale, scale);
    
                const posX = Math.random() * this.waypointAreaSize - this.waypointAreaSize / 2;
                const posZ = Math.random() * this.waypointAreaSize - this.waypointAreaSize / 2;
                gltf.scene.position.set(posX, 0, posZ);
    
                // Generate random waypoints for the giraffe within the extended area
                const waypoints = [];
                for (let j = 0; j < 5; j++) {
                    const waypointX = Math.random() * this.waypointAreaSize - this.waypointAreaSize / 2;
                    const waypointZ = Math.random() * this.waypointAreaSize - this.waypointAreaSize / 2;
                    waypoints.push({ x: waypointX, z: waypointZ });
                }
                gltf.scene.userData.type = 'giraffe'; // Set userData.type for giraffe objects
    
                // Store the giraffe object in the array with waypoints
                this._giraffes.push({
                    object: gltf.scene,
                    waypoints: waypoints,
                    currentWaypointIndex: 0,
                    speed: this.mvtSpeed, // Use class variable for speed
                    leavesEaten: 0,
                    height: height,
                });
    
                // Adjust color based on this.button3State
                if (this.button3State) {
                    const rainbowColors = [
                        0xFF0000, // Red
                        0xFF7F00, // Orange
                        0xFFFF00, // Yellow
                        0x00FF00, // Green
                        0x0000FF, // Blue
                        0x4B0082, // Indigo
                        0x9400D3  // Violet
                    ];
                    const colorIndex = Math.floor(Math.random() * rainbowColors.length); // Random index for color
                    
                    // Increase luminosity by multiplying RGB values by a factor
                    const luminosityFactor = 1.5; // Adjust as needed
                    const color = rainbowColors[colorIndex];
                    const r = Math.min((color >> 16) * luminosityFactor, 255);
                    const g = Math.min(((color >> 8) & 0xFF) * luminosityFactor, 255);
                    const b = Math.min((color & 0xFF) * luminosityFactor, 255);
    
                    gltf.scene.traverse((node) => {
                        if (node.isMesh) {
                            node.material.color.setRGB(r / 255, g / 255, b / 255);
                        }
                    });
                }
    
                // Add giraffe to the scene
                this._scene.add(gltf.scene);
            }, undefined, (error) => {
                console.error(error);
            });
        }
        setInterval(() => {
            this._update();
        }, 10);
    }
    
    

    _createTrees(numtrees) {
        const trunkHeight = 100; // Keep trunk height
        const trunkWidth = 10; // Keep trunk width
        const trunkDepth = 10; // Keep trunk depth
        const trunkColor = 0x8B4513; // Brown color
        const leavesColor = 0x00FF00; // Green color
        const leavesSize = 5; // Size of each leaf block
        const numBranches = 1; // Number of branches per tree
        const branchLength = 50; // Length of each branch (increased)
        const branchWidth = 5; // Width of each branch
        const branchSegments = 12; // Number of segments per branch (decreased)
        const numLeavesPerSegment = 2; // Number of leaves per branch segment
        const maxBranchLevels = 3; // Maximum levels of branches (including trunk)
    
        // Recursive function to create branches
        const createBranchesRecursive = (parentBranch, level) => {
            if (level >= maxBranchLevels) {
                return; // Stop recursion if maximum branch levels reached
            }
    
            for (let i = 0; i < 3; i++) { // Create 3 child branches
                const childBranch = new THREE.Group();
                const branchAngleX = Math.random() * Math.PI * 2;
                const branchAngleY = Math.random() * Math.PI * 2;
                const branchAngleZ = Math.random() * Math.PI * 2;
                for (let k = 0; k < branchSegments; k++) {
                    const branchSegment = new THREE.Mesh(
                        new THREE.BoxGeometry(branchWidth, branchWidth, branchWidth), // Adjust branch dimensions to cube
                        new THREE.MeshStandardMaterial({ color: trunkColor })
                    );
    
                    const segmentPosition = k * (branchLength / branchSegments); // Calculate position along the branch
    
                    // Adjust xOffset, yOffset, and zOffset to make branches go in different directions
                    const xOffset = Math.cos(branchAngleX) * segmentPosition;
                    const yOffset = Math.sin(branchAngleY) * segmentPosition + trunkHeight / 2;
                    const zOffset = Math.cos(branchAngleZ) * segmentPosition;
    
                    branchSegment.position.set(xOffset, yOffset, zOffset);
                    branchSegment.rotation.set(0, 0, 0);
    
                    childBranch.add(branchSegment);
    
                    // Add multiple random green blocks with variation in all directions
                    for (let l = 0; l < numLeavesPerSegment; l++) {
                        const leaf = new THREE.Mesh(
                            new THREE.BoxGeometry(leavesSize, leavesSize, leavesSize),
                            new THREE.MeshStandardMaterial({ color: leavesColor })
                        );
                        const leafXOffset = (Math.random() - 0.5) * 20; // Random offset in X-axis
                        const leafYOffset = (Math.random() - 0.5) * 20; // Random offset in Y-axis
                        const leafZOffset = (Math.random() - 0.5) * 20; // Random offset in Z-axis
                        leaf.position.set(xOffset + leafXOffset, yOffset + leafYOffset, zOffset + leafZOffset);
                        childBranch.add(leaf); // Add leaf to the child branch
                        this.leafObjects.push({ object: leaf});
                    }
                }
    
                parentBranch.add(childBranch); // Attach child branch to parent branch
    
                // Recursively create branches for child branch
                createBranchesRecursive(childBranch, level + 1);
            }
        };
    
        for (let i = 0; i < numtrees; i++) { // Reduce number of trees for better performance
            const trunk = new THREE.Mesh(
                new THREE.BoxGeometry(trunkWidth, trunkHeight, trunkDepth), // Adjust trunk dimensions
                new THREE.MeshStandardMaterial({ color: trunkColor })
            );
            trunk.userData.type = 'tree'; // Set userData.type for tree objects

    
           // const leaves = new THREE.Group();
    
            // Create branches for trunk
            for (let j = 0; j < numBranches; j++) {
                const branch = new THREE.Group();
                const branchAngleX = Math.random() * Math.PI * 2;
                const branchAngleY = Math.random() * Math.PI * 2;
                const branchAngleZ = Math.random() * Math.PI * 2;
                for (let k = 0; k < branchSegments; k++) {
                    const branchSegment = new THREE.Mesh(
                        new THREE.BoxGeometry(branchWidth, branchWidth, branchWidth), // Adjust branch dimensions to cube
                        new THREE.MeshStandardMaterial({ color: trunkColor })
                    );
    
                    const segmentPosition = k * (branchLength / branchSegments); // Calculate position along the branch
    
                    // Adjust xOffset, yOffset, and zOffset to make branches go in different directions
                    const xOffset = Math.cos(branchAngleX) * segmentPosition;
                    const yOffset = Math.sin(branchAngleY) * segmentPosition + trunkHeight / 2;
                    const zOffset = Math.cos(branchAngleZ) * segmentPosition;
    
                    branchSegment.position.set(xOffset, yOffset, zOffset);
                    branchSegment.rotation.set(0, 0, 0);
    
                    branch.add(branchSegment);
    
                    // Add multiple random green blocks with variation in all directions
                    for (let l = 0; l < numLeavesPerSegment; l++) {
                        const leaf = new THREE.Mesh(
                            new THREE.BoxGeometry(leavesSize, leavesSize, leavesSize),
                            new THREE.MeshStandardMaterial({ color: leavesColor })
                        );
                        const leafXOffset = (Math.random() - 0.5) * 20; // Random offset in X-axis
                        const leafYOffset = (Math.random() - 0.5) * 20; // Random offset in Y-axis
                        const leafZOffset = (Math.random() - 0.5) * 20; // Random offset in Z-axis
                        leaf.position.set(xOffset + leafXOffset, yOffset + leafYOffset, zOffset + leafZOffset);
                        branch.add(leaf); // Add leaf to the branch

                        this.leafObjects.push({
                            object: leaf
                        });
                    }
                }
    
                trunk.add(branch); // Attach branch to trunk
    
                // Recursively create branches for trunk branch
                createBranchesRecursive(branch, 1);
            }
    
            var randomx = Math.random() * 200 - 100;
            //var randomx = 0;
            var randomz = Math.random() * 200 - 100;
            //var randomz = -60;
            trunk.position.set(randomx, trunkHeight / 2, randomz);
            //leaves.position.set(randomx, trunkHeight / 2, randomz); // Position leaves around trunk
    
            trunk.castShadow = true;
            trunk.receiveShadow = true;
    
            this._scene.add(trunk);
            //this._scene.add(leaves);
        }
    }

    _RAF() {
        requestAnimationFrame(() => {
            this._RAF();
            this._threejs.render(this._scene, this._camera);
            this._controls.update();
        });
    }

    _OnKeyDown(event) {
        // Function to handle key down events
    }

    _OnKeyUp(event) {
        // Function to handle key up events
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
    }

    _handleMouseMove(event) {
        // Function to handle mouse movement
    }

    _update() {
        this._updateGiraffes();
        this._checkCollisions();
        
    }
}

window.addEventListener('DOMContentLoaded', () => {
    var theGame = new BasicWorldDemo();
});
