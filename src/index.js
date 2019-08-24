/* index */

// Imports
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as dat from 'dat.gui';

window.onload = function() {

    /* global attributes */
    var container;
    var camera, scene, renderer, controls
    var composer, renderer;

    var groupAll;

    var datProp = {
        type: ['lines', 'donut', 'squares'],
        selectedType: null,
        speed: 10,
        color: '#ff0086',
        at1: 50,
        at2: 50,
        at3: 50,
    }

    var bloomParam = {
        exposure: 1,
        bloomStrength: 1.5,
        bloomThreshold: 0,
        bloomRadius: 0
    };

    /* dat gui */
    var gui = new dat.GUI();

    gui.add(datProp, 'type', datProp.type).onChange(function(value) {
        clearScene()
        if (value === 'lines') {
            var lineObj3D = BuildLines(datProp.at1, datProp.at2, datProp.at3, datProp.color)
            lineObj3D.position.x = -(datProp.at1 * 10) / 2 // offset left by half
            lineObj3D.position.z = -(datProp.at3 * 10) / 2
            groupAll.add(lineObj3D)
        }
    })

    gui.addColor(datProp, 'color').onChange(function(value) {

    })

    gui.add(datProp, 'speed', 0, 100).onChange(function(value) {

    })

    gui.add(datProp, 'at1', 0, 100).onChange(function(value) {

    })

    gui.add(datProp, 'at2', 0, 100).onChange(function(value) {

    })

    gui.add(datProp, 'at3', 0, 100).onChange(function(value) {

    })


    /* three */
    init();
    animate();


    function init() {

        container = document.getElementById('content');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x353535);
        scene.fog = new THREE.Fog(0x353535, 1, 1000)

        groupAll = new THREE.Group();
        scene.add(groupAll)

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 150, 500);
        scene.add(camera);

        var light = new THREE.DirectionalLight(0xffffff, 0.8);
        camera.add(light);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ReinhardToneMapping; // bloom
        container.appendChild(renderer.domElement);

        // controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 50;
        controls.maxDistance = 1000;

        // unreal
        var renderScene = new RenderPass(scene, camera);

        var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = bloomParam.bloomThreshold;
        bloomPass.strength = bloomParam.bloomStrength;
        bloomPass.radius = bloomParam.bloomRadius;
        
        composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // resize
        window.addEventListener('resize', onWindowResize, false);

        // remove loading notice
        var loading = document.getElementById('loading');
        loading.parentNode.removeChild(loading)

        // helper
        var gridHelper = new THREE.GridHelper(500, 50, 0x0000ff, 0x808080);
        scene.add(gridHelper);

    }

    function clearScene() {
        console.log("clearing...", groupAll.children)
        groupAll.remove(...groupAll.children);

    }


    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        composer.render();
    }
// NOTE trying to get bloom filter working ...
/*
    function render() {
        // NOTE: mesh should reference attributes here
        renderer.render(scene, camera);
    }
*/
    function onWindowResize() {

        var width = window.innerWidth;
        var height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
    }

};


/* Line Shape Mesh Builder */
function BuildLines(at1, at2, at3, color) {

    var lineGroup = new THREE.Group();

    // line group
    for (var j = 0; j < at3; j++) {
        // line
        var segments = at1 * 10;
        var points = [];
        points.push(new THREE.Vector2(0, 0))

        for (var i = 0; i < segments; i++) {

            var x = i;
            var y = (Math.random() * at2) * Math.abs(Math.sin(i / 100)) + 10
            points.push(new THREE.Vector2(x, y))

        }
        points.push(new THREE.Vector2(segments - 1, 0))

        // create shape from points 
        var lineShape = new THREE.Shape(points)
        lineShape.autoClose = true;

        // create outline
        var pointsShape = lineShape.getPoints();
        var geometryPoints = new THREE.BufferGeometry().setFromPoints(pointsShape);
        var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: color }));
        line.position.z = j * 10;
        lineGroup.add(line)

        // create fill
        var geometry = new THREE.ShapeBufferGeometry(lineShape);
        var material = new THREE.MeshPhongMaterial({ color: color, opacity: 0.2, transparent: true })
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = j * 10;
        lineGroup.add(mesh)

    }

    return (lineGroup)
}




//