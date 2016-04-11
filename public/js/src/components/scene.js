import React from 'react';
import ReactDOM from 'react-dom';
import THREE from 'three';
import OrbitControls from 'three-orbit-controls';

import { v4 } from 'uuid';

import { distance, mid, angle } from './point';
import Car from './car';
import Segment from './segment';

class SceneComponent extends React.Component {
	
	constructor() {
		super();

		this.state = { 
			t: 0,
			cars: [],
			keysdown: {},
			paused: false
		};
	}

	init() {

		let _this = this;

		let Scene = new THREE.Scene();
		let cars = [];
		let segments = [];
		let objects = { cars: [], segments: [] };

		this.setState({ cars }, function() {
			window.car = _this.state.cars[0];
		});

		// ground plane
		let Plane = new THREE.Mesh(
			new THREE.PlaneGeometry(10000, 10000),
			new THREE.MeshLambertMaterial({ color: '#ccc' })
		);
		Plane.position.set(0, -2, 0);
		Plane.rotation.set( -Math.PI / 2, 0, 0 );
		Scene.add(Plane);

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( 240, 0, 0 ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, 0, 240 )
		);

		// ground axes
		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		}),
		line = new THREE.Line( geometry, material );
		Scene.add( line );

		// community center
		let Circle = new THREE.Mesh(
			new THREE.CircleGeometry(120, 40),
			new THREE.MeshBasicMaterial({ 
				color: '#fff',
				transparent: true,
				opacity: 0.5
			})
		);
		Circle.rotation.set(-Math.PI / 2, 0, 0);
		Scene.add(Circle);

		const canvas = this.refs.canvas;
		const mouse = new THREE.Vector2();
		const raycaster = new THREE.Raycaster();

		let Camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		Camera.position.set(150, 100, 150);

		let ThreeOrbitControls = OrbitControls(THREE);
		let controls = new ThreeOrbitControls( Camera, canvas );
		controls.mouseButtons = {
	        ORBIT: THREE.MOUSE.LEFT,
	        PAN: THREE.MOUSE.RIGHT
	    };
	    controls.enableKeys = false;

	    controls.maxPolarAngle = Math.PI / 2;
	    controls.maxDistance = 8000;
	    controls.damping = 0.5;

		let Renderer = new THREE.WebGLRenderer({
			antialias: true,
		    preserveDrawingBuffer: true,
			canvas,
			shadowMapEnabled: true
		});

		Renderer.setClearColor('#e2e2e2');
		Renderer.setSize(window.innerWidth, window.innerHeight);

		Camera.lookAt(new THREE.Vector3(0, 0, 0));

		let Light = new THREE.DirectionalLight('#eee');
		Light.position.set(0, 100, 100);
		Light.target = new THREE.Mesh();
		Scene.add(Light);

		var intersects = [],
			planeIntersection;

		let render = function() {

			let t = _this.state.t;

			_this.setState({ t: t + 1 });
 
			Renderer.render(Scene, Camera);

			raycaster.setFromCamera(mouse, Camera);
			intersects = raycaster.intersectObjects([ Plane ]);
			
			if ( Camera.position.y < 50 ) Camera.position.setY(50);

			if ( !this.state.paused ) {
				window.requestAnimationFrame(render);
				// setTimeout(render, 50);
			}
		}.bind(this);

		render();

		function onResize() {
			Camera.aspect = window.innerWidth / window.innerHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize(window.innerWidth, window.innerHeight);
		}

		window.addEventListener('resize', onResize);

		window.addEventListener('keydown', function(e) {

			if ( e.keyCode === 32 ) {
				if ( !this.state.paused ) {
					this.setState({ paused: true });
					render();
				} else {
					this.setState({ paused: false });
				}
			}
		}.bind(this));

		canvas.addEventListener('mousemove', function(e) {
			mouse.x = 2 * e.layerX / canvas.width - 1;
			mouse.y = -2 * e.layerY / canvas.height + 1;

			if ( intersects[0] ) {
				previewMesh.position.setX(intersects[0].point.x);
				previewMesh.position.setZ(intersects[0].point.z);
				previewMesh.rotation.set(0, Math.atan(Camera.position.x / Camera.position.z), 0);
			}
		}.bind(this));

		var previewGeo = new THREE.BoxGeometry(20, 10, 20);
		var previewMesh = new THREE.Mesh(previewGeo, new THREE.MeshLambertMaterial({
			opacity: 0.5,
			transparent: true
		}));
		Scene.add(previewMesh);

		var mouseDown = {};

		window.addEventListener('mousedown', function() {
			mouseDown.x = mouse.x;
			mouseDown.y = mouse.y;
		});

		var newMaterial = new THREE.MeshLambertMaterial({
			color: '#f00'
		});

		window.addEventListener('mouseup', function() {

			if ( mouse.x === mouseDown.x && mouse.y === mouseDown.y ) {

				var newMesh = previewMesh.clone();
				newMesh.material = newMaterial;
				Scene.add(newMesh);

			}
		});

	}

	componentDidMount() {
		this.init.call(this);
	}

	render() {
		return (
			<div>
				<canvas ref="canvas" />
			</div>
		);
	}
}

export default SceneComponent;