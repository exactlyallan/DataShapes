// index 

// Imports
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

window.onload = function() {

    // global attributes 
    var container3D;
    var camera, scene, renderer, controls, drawContainer, drawCanvas, drawContext, pencil;
    var raycaster, mouse, intersected;


    var groupAll;

    var drawArrayX = [];
    var drawArrayY = [];
    var chartsData = [];

    var datProp = {
        speed: 0.15,
        color: '#ff0086',
        lines: 50,
        opacity: 0.2,
        noise: 0.2,
        amplitude: 1,
    }

    var gridSize = 500;
    var gridHeight = 100;

    // dat gui 
    var gui = new dat.GUI({ autoPlace: false });
    var customContainer = document.getElementById('dat-gui');
    customContainer.appendChild(gui.domElement);

    gui.addColor(datProp, 'color').onChange(function(value) {

        for(let i = 0; i < groupAll.children.length; i++){

            groupAll.children[i].material.color.set(value)
        }

        drawContext.strokeStyle = value;

    })

    gui.add(datProp, 'speed', 0, 1).onChange(function(value) {
        controls.autoRotateSpeed = value;
    })

    gui.add(datProp, 'lines', 0, 50).onChange(function(value) {
        clearScene();
        build_data();
    })

    gui.add(datProp, 'opacity', 0, 1.0).onChange(function(value) {
        clearScene();
        build_data();
    })

    gui.add(datProp, 'noise', 0, 1.0).onChange(function(value) {
        clearScene();
        build_data();
    })

    gui.add(datProp, 'amplitude', 0, 2.0).onChange(function(value) {
        clearScene();
        build_data();
    })


    // three
    init_lines();
    animate();


    function init_lines() {

        container3D = document.getElementById('content');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x353535);
        scene.fog = new THREE.Fog(0x353535, 5, 1700)

        groupAll = new THREE.Group();
        scene.add(groupAll)

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1500);
        camera.position.set(0, 170, 450);
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
        controls.minDistance = 400;
        controls.maxDistance = 1100;
        controls.autoRotate = true;
        controls.autoRotateSpeed = datProp.speed;

        // raycast select
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // resize
        window.addEventListener('resize', onWindowResize, false);

        // mouse raycast
        document.addEventListener('mousemove', onDocumentMouseMove, false)

        // click select
        document.addEventListener('click', onMouseClick, false)

        // remove loading notice
        var loading = document.getElementById('loading');
        loading.parentNode.removeChild(loading)

        // helper
        var gridHelper = new THREE.GridHelper(gridSize, gridSize / 10, datProp.color, 0x808080);
        scene.add(gridHelper);

    }

    // THREE clear
    function clearScene() {
        console.log("clearing...")
        groupAll.remove(...groupAll.children);

    }

    // THREE animate
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        render();
    }

    // THREE render
    function render() {

        // raycast to hilight obj 
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(groupAll.children, false);

        // only get first intersected, only get face values, update color or reset color
        if (intersects.length > 0 && intersects[0].object.type === "Mesh") {

            if( intersected != intersects[0].object ){
              
                // clear previous
                if(intersected){
                    intersected.material.color.set( datProp.color)
                    intersected.material.opacity = datProp.opacity
                }


                intersected = intersects[0].object;
                intersected.material.color.setHex( 0xffffff )
                intersected.material.opacity = Math.max(datProp.opacity, 0.8)

            } 

        } else {
                if( intersected ){
                   intersected.material.color.set( datProp.color )
                   intersected.material.opacity = datProp.opacity
                   intersected = null;     

                }

            }
        renderer.render(scene, camera);
    }

    // build line data
    function build_data() {

        console.log("building data...")

        let maxX = Math.max(...drawArrayX)
        let maxY = Math.max(...drawArrayY)

        // reset
        chartsData = []

        // for number of lines selected, build data
        for (let i = 0; i < datProp.lines; i++) {

            let oneChartData = [];

            // for each value in draw data
            for (let j = 0; j < drawArrayX.length; j++) {

                // normalizeX
                var normalizedX = (drawArrayX[j] / maxX) * gridSize;

                // normalizeY + noise + amp
                var normalizedY = (((drawArrayY[j] + (Math.random() * (maxY / 3) * datProp.noise)) / maxY) * gridHeight) * datProp.amplitude;

                oneChartData.push([normalizedX, normalizedY])

            }

            chartsData.push(oneChartData)

        }

        build_lines()

    }


    // Line Shape Mesh Builder
    function build_lines() {

        // clear previous scene
        clearScene();

        // line group
        for (let i = 0; i < chartsData.length; i++) {

            // line
            var points = [];

            // start point bottom
            points.push(new THREE.Vector2(0, 0))

            // line segments for single charts
            for (let j = 0; j < chartsData[i].length; j++) {
                points.push(new THREE.Vector2(chartsData[i][j][0], chartsData[i][j][1]))

            }
            // end point bottom
            points.push(new THREE.Vector2(points[points.length - 1].x, 0))

            // create shape from points 
            var lineShape = new THREE.Shape(points)
            lineShape.autoClose = true;

            // create outline
            var pointsShape = lineShape.getPoints();
            var geometryPoints = new THREE.BufferGeometry().setFromPoints(pointsShape);
            var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: datProp.color }));
            line.position.z = i * -10;

            line.name = "line" + i;
            line.translateX(-gridSize / 2)
            line.translateZ(gridSize / 2)

            groupAll.add(line)

            // create fill
            var geometry = new THREE.ShapeBufferGeometry(lineShape);
            geometry.computeBoundingSphere();
            var material = new THREE.MeshLambertMaterial({ color: datProp.color, opacity: datProp.opacity, transparent: true })
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.z = i * -10;

            mesh.name = "mesh" + i;
            mesh.translateX(-gridSize / 2)
            mesh.translateZ(gridSize / 2)

            groupAll.add(mesh)

        }

    }

    // TWO 
    init_draw_space()

    // draw canvas 
    // based on ROBO Design - https://dev.opera.com/articles/html5-canvas-painting/ 
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

        // Intro text
        drawContext.font = "20px Arial";
        drawContext.textAlign = "center";
        drawContext.fillStyle = datProp.color;
        drawContext.fillText("- Draw A Line Here To Start -", drawCanvas.width/2, drawCanvas.height/2);

        // Attach the mousedown, mousemove and mouseup event listeners
        drawCanvas.addEventListener('mousedown', ev_canvas, false);
        drawCanvas.addEventListener('mousemove', ev_canvas, false);
        drawCanvas.addEventListener('mouseup', ev_canvas, false);

    }

    // draw start / stop events
    function tool_pencil() {
        var tool = this;
        this.started = false;

        var startX = 0; // start point offset
        var startY = 0; // inverted Y offset
        var prevX = 0; // prevents backtracking

        this.mousedown = function(ev) {
            // clear previous drawing and data
            startX = ev._x
            prevX = 0;
            drawContext.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            drawArrayX = [];
            drawArrayY = [];

            drawContext.beginPath()
            drawContext.moveTo(ev._x, ev._y)
            tool.started = true;
        };

        this.mousemove = function(ev) {
            if (tool.started) {

                // Prevent drawing from regressing back x, only well-defined values
                if (ev._x > prevX) {

                    prevX = ev._x;

                    drawContext.lineTo(ev._x, ev._y);
                    drawContext.stroke();

                    // save draw data
                    var offsetx = ev._x - startX;
                    var offsety = drawCanvas.height - ev._y;
                    drawArrayX.push(offsetx);
                    drawArrayY.push(offsety);
                }

            }

        };

        this.mouseup = function(ev) {
            if (tool.started) {
                tool.mousemove(ev);
                tool.started = false;

                // build chart data
                build_data()

            }
        };
    }

    // The general-purpose event handler, tracks position relative to canvas
    function ev_canvas(ev) {

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

    // resise canvas (2D / 3D)
    function onWindowResize() {

        // three 
        var width = window.innerWidth;
        var height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);


        // two 
        drawCanvas.width = drawContainer.clientWidth;
        drawCanvas.height = drawContainer.clientHeight;
        drawContext.strokeStyle = datProp.color; // all context reset on resize

    }

    // raycast mouse
    function onDocumentMouseMove(ev) {
        ev.preventDefault();
        mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    }

    // mouse click
    function onMouseClick(ev) {
        ev.preventDefault();

        if(intersected){
            console.log("Selected:", intersected.name)
        }

    }

};





//