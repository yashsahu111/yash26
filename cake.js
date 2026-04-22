// cake.js - Realistic Cake Cutting Animation for Mobile
// Uses Three.js

let scene, camera, renderer, cake, knife, slice, isCut = false;
let container = document.getElementById('cake-container');

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = null; // Transparent background to show CSS gradient

    // 2. Camera Setup (Optimized for Mobile view)
    const aspectRatio = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
    camera.position.set(0, 1.5, 3); // Positioned slightly above and in front
    camera.lookAt(0, 0.5, 0);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Sharp on high-res mobile screens
    renderer.shadowMap.enabled = true; // Enable shadows for realism
    container.appendChild(renderer.domElement);

    // 4. Lighting (Crucial for realism)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft base light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Key light
    directionalLight.position.set(1, 2, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    createCake();
    createKnife();

    // Event Listeners for Interaction
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('touchstart', onCakeTap, false); // Mobile touch
    container.addEventListener('mousedown', onCakeTap, false);  // Desktop click
    document.getElementById('reset-btn').addEventListener('click', resetAnimation);

    animate();
}

function createCake() {
    cake = new THREE.Group();

    // Cake Material (Realistic Pink Frosting)
    const frostingMaterial = new THREE.MeshPhongMaterial({
        color: 0xf48fb1, // Light Pink
        specular: 0x111111,
        shininess: 30,
        flatShading: false
    });

    // Create 3 Tiers
    for (let i = 0; i < 3; i++) {
        const radius = 0.8 - (i * 0.15);
        const height = 0.4;
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const tier = new THREE.Mesh(geometry, frostingMaterial);
        tier.position.y = (height / 2) + (i * height);
        tier.castShadow = true;
        tier.receiveShadow = true;
        cake.add(tier);
    }

    // Add Plate
    const plateGeometry = new THREE.CylinderGeometry(1, 1, 0.05, 32);
    const plateMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = -0.025;
    plate.receiveShadow = true;
    cake.add(plate);

    scene.add(cake);
}

function createKnife() {
    knife = new THREE.Group();

    // Knife Blade (Metal)
    const bladeGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.01);
    const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.8,
        roughness: 0.2
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    knife.add(blade);

    // Knife Handle (Pink)
    const handleGeometry = new THREE.BoxGeometry(0.12, 0.3, 0.05);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xad1457 }); // Dark Pink
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.45;
    knife.add(handle);

    // Initial Position (Hidden/Above)
    knife.position.set(0, 2, 0);
    knife.rotation.x = Math.PI / 2; // Pointing down
    scene.add(knife);
}

// Interaction Logic
function onCakeTap(event) {
    if (isCut) return; // Only cut once
    event.preventDefault();
    cutCakeAnimation();
}

function cutCakeAnimation() {
    isCut = true;
    const duration = 1000; // ms
    const startTime = performance.now();

    function animationStep(now) {
        const progress = (now - startTime) / duration;

        if (progress < 0.3) {
            // 1. Knife descends rapidly
            knife.position.y = 2 - (progress * 5); // Hits cake at y ~ 0.5
        } else if (progress < 0.6) {
            // 2. Knife cuts through cake slowly
            knife.position.y = 0.5 - ((progress - 0.3) * 1.6); // Bottoms out
        } else if (progress < 1.0) {
            // 3. Knife lifts and a slice separates
            knife.position.y = 0.0 - ((progress - 0.6) * -4); // Lifts back up
            knife.position.x = (progress - 0.6) * 2; // Moves side

            // Create a temporary 'slice' object for visualization
            if (!slice) {
                const sliceGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32, 1, false, 0, Math.PI / 4);
                const frostingMaterial = new THREE.MeshPhongMaterial({ color: 0xf48fb1 });
                slice = new THREE.Mesh(sliceGeometry, frostingMaterial);
                slice.position.y = 0.6;
                slice.rotation.y = -Math.PI/8;
                scene.add(slice);

                // Hide the main cake (simple visualization trick)
                cake.visible = false;
            }
            slice.position.x = (progress - 0.6) * 1; // Move slice out
            slice.position.z = (progress - 0.6) * 1;
        }

        if (progress < 1.0) {
            requestAnimationFrame(animationStep);
        }
    }
    requestAnimationFrame(animationStep);
}

function resetAnimation() {
    isCut = false;
    scene.remove(knife);
    if(slice) scene.remove(slice);
    cake.visible = true;
    createKnife();
    slice = null;
}

// Main Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Slowly rotate the cake for display
    if (cake && !isCut) {
        cake.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// Handle Mobile Orientation Changes
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Start everything
init();
