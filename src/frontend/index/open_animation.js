import { wait } from "../utils/misc.js"
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Credit model to -> Loïc Norgeot (https://sketchfab.com/norgeotloic)
// https://skfb.ly/6QWpW
export default async function beginOpenAnimation() {

    if(localStorage.getItem('has-visited-once') === 'true') {
        document.body.removeChild(document.getElementById("open-scene"));
        return
    }

    let model

    // 1. Setup your standard Three.js scene boilerplate
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const renderElement = renderer.domElement
    renderElement.classList.add("transition-all");
    renderElement.classList.add("duration-5000");
    document.getElementById("open-scene").appendChild(renderElement);


    // 2. Add lighting (Crucial! GLTF materials look black without lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // 3. Instantiate the GLTF Loader
    const loader = new GLTFLoader();

    // 4. Load your downloaded file
    loader.load(
        '/imgs/open-cutscene/a_windy_day.glb', // Path to your file inside the public folder
        (gltf) => {
            model = gltf.scene;
            scene.add(model);
        },
        (xhr) => {
            // Optional: Tracks loading progress percentage
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            // Fires if something goes wrong (broken path, corrupted file)
            console.error('An error happened while loading the model:', error);
        }
    );

    // 5. Position your camera back so you can see the asset
    camera.position.set(0, 0, 2);

    // 6. Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            model.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }
    animate();

    await wait(500);
    document.querySelector("#branding-text-meaning > :first-child").classList.remove("opacity-0")
    document.querySelector("#branding-text-meaning > :first-child").classList.add("opacity-100")
    
    for (const p of document.querySelectorAll("#branding-text-meaning > p:not(:first-child, .overlapped)")) {
        await wait(500);
        p.classList.remove("opacity-0")
        p.classList.add("opacity-100")
    }
    
    await wait(500)
    
    for (const [i, p] of document.querySelectorAll("#branding-text-meaning > p.overlapped").entries()) {
        p.classList.remove("opacity-0")
        p.classList.add("opacity-100")
        setTimeout(() => {
            p.classList.remove(`-translate-y-${(i + 1) * 40}`)
        }, 200)
    }

    await wait(250)

    for (const p of document.querySelectorAll("#branding-text-meaning > p")) {
        p.style = ""
    }
    
    await wait(1000)

    await wait(500)
    document.getElementById("branding-text-meaning").classList.add("scale-1000")
    document.getElementById("branding-text-meaning").classList.add("opacity-0")

    await wait(500)
    document.getElementById("book").style = "";
    await wait(500);

    for(const img of document.querySelectorAll("#scene-play img:not(#book)")) {
        await wait(500);
        img.style = "transform: rotateX(0deg)";
    }

    await wait(500)
    renderElement.style.transform = "translateY(-10vh) scale(1)"
    renderElement.style.opacity = 1
    document.getElementById("open-scene").classList.add("duration-2000")
    await wait(2000)
    document.getElementById("open-scene").style.background = "transparent";
    await wait(500)
    document.querySelector("#scene-play").style = "transform: translateY(20%) scale(2);"
    document.querySelector("#scene-play").classList.add("opacity-0")
    await wait(1000)
    renderElement.style = ""
    await wait(5000)
    document.getElementById("open-scene").classList.add("hidden");
    document.body.removeChild(document.getElementById("open-scene"));

    localStorage.setItem("has-visited-once", "true");
}
