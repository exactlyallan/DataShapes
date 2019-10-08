/* index */

// Imports
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

window.onload = function() {

    /* global attributes */
    var container3D;
    var camera, scene, renderer, controls, drawContainer, drawCanvas, drawContext, pencil;

    var groupAll;

    var dataArray = [];

    var datProp = {
        type: ['lines', 'donut', 'squares'],
        selectedType: null,
        speed: 10,
        color: '#ff0086',
        at1: 50,
        at2: 50,
        at3: 50,
    }

    /* dat gui */
    var gui = new dat.GUI({autoPlace: false});
    var customContainer = document.getElementById('dat-gui');
    customContainer.appendChild(gui.domElement);

    gui.add(datProp, 'type', datProp.type).onChange(function(value) {
        clearScene()
        if (value === 'lines') {
            var lineObj3D = build_lines()
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
    init_lines();
    animate();


    function init_lines() {

        container3D = document.getElementById('content');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x353535);
        scene.fog = new THREE.Fog(0x353535, 1, 1000)

        groupAll = new THREE.Group();
        scene.add(groupAll)

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 150, 500);
        scene.add(camera);

        var light = new THREE.DirectionalLight(0xffffff, 1.0);
        camera.add(light);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container3D.appendChild(renderer.domElement);

        // controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 50;
        controls.maxDistance = 1000;

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
        render();
    }

    function render() {
        // NOTE: mesh should reference attributes here
         renderer.render(scene, camera);
    }


    /* two */
    init_draw_space()

    /* draw canvas */
    /* based on ROBO Design - https://dev.opera.com/articles/html5-canvas-painting/ */
    function init_draw_space() {
       
       // The pencil tool instance
        pencil = new tool_pencil();

        drawContainer = document.getElementById('draw-container');
        drawCanvas = document.createElement('canvas');

        drawCanvas.width = drawContainer.clientWidth;
        drawCanvas.height = drawContainer.clientHeight;
        drawContainer.appendChild(drawCanvas);

        drawContext = drawCanvas.getContext('2d');

        drawContext.strokeStyle = datProp.color;

        // Attach the mousedown, mousemove and mouseup event listeners
        drawCanvas.addEventListener('mousedown', ev_canvas, false);
        drawCanvas.addEventListener('mousemove', ev_canvas, false);
        drawCanvas.addEventListener('mouseup', ev_canvas, false);

    }

    // draw start / stop events
    function tool_pencil () {
        var tool = this;
        this.started = false;

        var prevX = 0;

        this.mousedown = function (ev) {
                // clear previous drawing and data
                prevX = 0;
                drawContext.clearRect(0,0, drawCanvas.width, drawCanvas.height)
                dataArray = []

                drawContext.beginPath();
                drawContext.moveTo(ev._x, ev._y);
                tool.started = true;
        };

        this.mousemove = function (ev) {
            if (tool.started) {

                // Prevent drawing from regressing back x, only well-defined values
                if(ev._x > prevX){

                    prevX = ev._x

                    drawContext.lineTo(ev._x, ev._y);
                    drawContext.stroke();

                    // save draw data
                    dataArray.push([ev._x, ev._y])
                }

            }

        };

        this.mouseup = function (ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                console.log("Data:", dataArray)
            }
        };
    }

    // The general-purpose event handler, tracks position relative to canvas
    function ev_canvas (ev) {
        
        // Firefox
        if (ev.layerX || ev.layerX == 0) {
            ev._x = ev.layerX;
            ev._y = ev.layerY;
        // Opera
        } else if (ev.offsetX || ev.offsetX == 0) {
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;
        }
        
        var func = pencil[ev.type];
        if (func) {
            func(ev);
        }

    }


    /* Line Shape Mesh Builder */
    function build_lines() {

        var lineGroup = new THREE.Group();

        // line group
        for (var j = 0; j < datProp.at3; j++) {
            // line
            var segments = datProp.at1 * 10;
            var points = [];
            points.push(new THREE.Vector2(0, 0))

            for (var i = 0; i < segments; i++) {

                var x = i;
                var y = (Math.random() * datProp.at2) * Math.abs(Math.sin(i / 100)) + 10
                points.push(new THREE.Vector2(x, y))

            }
            points.push(new THREE.Vector2(segments - 1, 0))

            // create shape from points 
            var lineShape = new THREE.Shape(points)
            lineShape.autoClose = true;

            // create outline
            var pointsShape = lineShape.getPoints();
            var geometryPoints = new THREE.BufferGeometry().setFromPoints(pointsShape);
            var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: datProp.color }));
            line.position.z = j * 10;
            lineGroup.add(line)

            // create fill
            var geometry = new THREE.ShapeBufferGeometry(lineShape);
            var material = new THREE.MeshPhongMaterial({ color: datProp.color, opacity: 0.2, transparent: true })
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.z = j * 10;
            lineGroup.add(mesh)

        }

        return (lineGroup)
    }


    function onWindowResize() {

        /* three */
        var width = window.innerWidth;
        var height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);


        /* two */
        drawCanvas.width = drawContainer.clientWidth;
        drawCanvas.height = drawContainer.clientHeight;
        drawContext.strokeStyle = datProp.color; // all context reset on resize

    }

};





//