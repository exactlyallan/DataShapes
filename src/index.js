/* index */

// Imports
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

window.onload = function() {

    /* global attributes */
    var types = ['lines', 'donut', 'squares']
    var selectedType = types[0]
    var speed = 10
    var color = '#ff0086'
    var at1 = 50;
    var at2 = 50;
    var at3 = 50;

    var container;
    var camera, scene, renderer;
    var groupAll;


    /* dat gui */
    var gui = new dat.GUI();
    var datProp = new DatProps(selectedType, color, speed, at1, at2, at3)

    gui.add(datProp, 'type', types).onChange(function(value) {
        var lineObj3D = new BuildLines(at1, at2, color)
        groupAll.add(lineObj3D)
    })

    gui.addColor(datProp, 'color').onChange(function(value) {
        color = value;
    })

    gui.add(datProp, 'speed', 0, 100).onChange(function(value) {
        speed = value;
    })

    gui.add(datProp, 'at1', 0, 100).onChange(function(value) {
        at1 = value;
    })

    gui.add(datProp, 'at2', 0, 100).onChange(function(value) {
        at2 = value;
    })

    gui.add(datProp, 'at3', 0, 100).onChange(function(value) {
        at3 = value;
    })


    /* three */
    init();
    animate();


    function init() {

        container = document.getElementById('content');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        groupAll = new THREE.Group();
        scene.add(groupAll)

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 150, 500);
        scene.add(camera);

        var light = new THREE.DirectionalLight(0xffffff, 0.8);
        camera.add(light);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);

    }

    function clearScene() {

        groupAll.remove(groupAll.children);

    }


    function animate() {
        //requestAnimationFrame(animate);
        //render();
    }

    function render() {
        // NOTE: mesh should reference attributes here
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

};

/* dat GUI props */
const DatProps = function(type, color, speed, at1, at2, at3) {
    this.type = type;
    this.color = color;
    this.speed = speed;
    this.at1 = at1;
    this.at2 = at2;
    this.at3 = at3;
}


/* Line Shape Mesh Builder */
const BuildLines = function(param1, param2, color) {

        console.log("buildLines:", param1, param2, color)

        var segments = 1000;
        var points = [];

        for ( var i = 0; i < segments; i ++ ) {
            var x = i;
            var y = Math.random() * 100        
            var z = Math.random() * 10

            // points
            points.push( x, y, z );

        }

        // NOTE - need to specify as SHAPE?

        /*
        console.log(points)
        var material = new THREE.LineBasicMaterial( { color: color } );
        var geometryPoints = new THREE.BufferGeometry().setFromPoints( points );
        //geometryPoints.computeBoundingSphere();

        //this.line = new THREE.Line( geometryPoints, material );
        */
}




// 