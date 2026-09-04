import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/utils/BufferGeometryUtils.js";

console.log("Botopsy Starting...");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);
light.castShadow = true;
scene.add(light);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 5;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const loader = new GLTFLoader();

console.log("Loader Created");
console.log("Trying to load Model...");

loader.load(
    "models/kitbot2026.glb",
    (gltf) => {
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.rotation.x = -Math.PI / 2;
        gltf.scene.position.y = 0.2;

        scene.add(gltf.scene);

        const optimizedModel = new THREE.Group();
        optimizedModel.name = "Optimized KitBot";
        scene.add(optimizedModel);

        console.log("Preparing geometry optimization...");

        gltf.scene.updateWorldMatrix(true, true);

        const geometryGroups = new Map();

        gltf.scene.traverse((child) => {
            if (!child.isMesh) return;

            const material = child.material;

            if (!geometryGroups.has(material)) {
                geometryGroups.set(material, []);
            }

            const geometry = child.geometry.clone();
            geometry.applyMatrix4(child.matrixWorld);

            geometryGroups.get(material).push(geometry);
        });

        console.log("Geometry Groups:", geometryGroups.size);
        console.log("Merging geometry...");

        for (const [material, geometries] of geometryGroups) {
            const mergedGeometry =
                BufferGeometryUtils.mergeGeometries(
                    geometries,
                    false
                );

            if (!mergedGeometry) {
                console.error(
                    "Failed to merge geometry for:",
                    material.name
                );
                continue;
            }

            const mesh = new THREE.Mesh(
                mergedGeometry,
                material
            );

            mesh.castShadow = false;
            mesh.receiveShadow = false;

            optimizedModel.add(mesh);

            for (const geometry of  geometries) {
                geometry.dispose();
            }
        }

        console.log("Optimization complete!");

        gltf.scene.visible = false;

        let meshCount = 0;
        let triangleCount = 0;
        const materials = new Set();

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                materials.add(child.material);
                meshCount++;

                if (child.geometry.index) {
                    triangleCount += child.geometry.index.count / 3;
                } else {
                    triangleCount +=
                        child.geometry.attributes.position.count / 3;
                }

                child.frustumCulled = true;
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });

        console.log("Original Mesh Count:", meshCount);
        console.log("Original Triangle Count:", triangleCount);
        console.log("Unique Materials:", materials.size);

        const box =
            new THREE.Box3().setFromObject(gltf.scene);

        const size =
            box.getSize(new THREE.Vector3());

        console.log("Model Size:", size);
    },

    undefined,

    (error) => {
        console.error(
            "An error happened while loading the model:",
            error
        );
    }
);

const floorGeometry =
    new THREE.PlaneGeometry(20, 20);

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x222222
    });

const floor =
    new THREE.Mesh(
        floorGeometry,
        floorMaterial
    );

floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;

scene.add(floor);

const componentHitboxes = new THREE.Group();
componentHitboxes.name = "Component Hitboxes";
scene.add(componentHitboxes);

const driveMotorHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);
driveMotorHitbox.position.set(0.5, 0.42, 1.35);

driveMotorHitbox.userData.componentId = "drive_motor_1";
driveMotorHitbox.userData.componentName = "Drive Motor 1";

componentHitboxes.add(driveMotorHitbox);

const driveMotorHitbox2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);
driveMotorHitbox2.position.set(-0.5, 0.42, 1.35);
driveMotorHitbox2.userData.componentId = "drive_motor_2";
driveMotorHitbox2.userData.componentName = "Drive Motor 2";

componentHitboxes.add(driveMotorHitbox2);

const driveMotorHitbox3 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);
driveMotorHitbox3.position.set(-0.5, 0.42, 1.05);
driveMotorHitbox3.userData.componentId = "drive_motor_3";
driveMotorHitbox3.userData.componentName = "Drive Motor 3";

componentHitboxes.add(driveMotorHitbox3);

const driveMotorHitbox4 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);
driveMotorHitbox4.position.set(0.5, 0.42, 1.05);
driveMotorHitbox4.userData.componentId = "drive_motor_4";
driveMotorHitbox4.userData.componentName = "Drive Motor 4";

componentHitboxes.add(driveMotorHitbox4);

const shooterMotorHitbox1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);
shooterMotorHitbox1.position.set(0.7, 1.5, 1.64);
shooterMotorHitbox1.userData.componentId = "shooter_motor_1";
shooterMotorHitbox1.userData.componentName = "Shooter Motor 1";

componentHitboxes.add(shooterMotorHitbox1);

const shooterMotorHitbox2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);
shooterMotorHitbox2.position.set(-0.7, 1.5, 1.64);
shooterMotorHitbox2.userData.componentId = "shooter_motor_2";
shooterMotorHitbox2.userData.componentName = "Shooter Motor 2";

componentHitboxes.add(shooterMotorHitbox2);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(
        componentHitboxes.children,
        true
    );
    if (intersections.length > 0) {
        const component = intersections[0].object;

        console.log(
            "Selected:",
            component.userData.componentName,
        );
    }
});

let frames = 0;
let lastTime = performance.now();

setInterval(() => {
    const now = performance.now();

    const fps =
        frames / ((now - lastTime) / 1000);

    console.log("FPS:", fps.toFixed(1));

    frames = 0;
    lastTime = now;
}, 1000);

function animate() {
    requestAnimationFrame(animate);

    frames++;

    controls.update();

    renderer.render(
        scene,
        camera
    );
}

animate();

window.addEventListener("resize", () => {
    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});