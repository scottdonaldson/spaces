import React from 'react';
import ReactDOM from 'react-dom';
import THREE from 'three';
import OrbitControls from 'three-orbit-controls';

import { v4 } from 'uuid';

import { distance, mid, angle } from './point';
import intersect from './intersection';
import Car from './car';
import Segment from './segment';

class SceneComponent extends React.Component {
	
	constructor() {
		super();

		this.state = { 
			t: 0,
			keysdown: {},
			paused: false,
			placing: false,
			boxes: []
		};
	}

	init() {

		let _this = this;

		let Scene = new THREE.Scene();

		// ground plane
		let Plane = new THREE.Mesh(
			new THREE.PlaneGeometry(10000, 10000),
			new THREE.MeshLambertMaterial({ color: '#ccc' })
		);
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
		Circle.position.set(0, 0.5, 0);
		Scene.add(Circle);

		var circleLight = new THREE.PointLight('#fff', 1, 800);
		circleLight.position.set(0, 50, 0);
		Scene.add(circleLight);

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

		let Light = new THREE.DirectionalLight('#eee'),
			lightDistance = 1000,
			lightPeriod = 2000;
		Light.position.set(0, lightDistance, 0);
		Light.target = new THREE.Mesh(); // 0, 0, 0
		Scene.add(Light);

		var intersects = [],
			planeIntersection;

		let render = function() {

			let t = _this.state.t;

			_this.setState({ t: t + 1 });

			var lightX = lightDistance * Math.sin(2 * Math.PI * t / lightPeriod),
				lightY = lightDistance * Math.cos(2 * Math.PI * t / lightPeriod),
				lightZ = lightX;

			Light.position.set( lightX, lightY, lightZ );
 
			Renderer.render(Scene, Camera);

			raycaster.setFromCamera(mouse, Camera);
			intersects = raycaster.intersectObjects(Scene.children);
			planeIntersection = raycaster.intersectObjects([ Plane ]);
			
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
				var paused = !this.state.paused;
				this.setState({ paused }, render);
			}
		}.bind(this));

		canvas.addEventListener('mousemove', function(e) {

			// update mouse
			mouse.x = 2 * e.layerX / canvas.width - 1;
			mouse.y = -2 * e.layerY / canvas.height + 1;

			// update preview mesh
			previewMesh.visible = this.state.placing;

			// visibility of preview mesh acting as a proxy for placing...
			// also useful because we might be placing but intersecting with another box
			// (in which case don't allow placement)
			if ( previewMesh.visible && planeIntersection[0] ) {

				var x1 = previewMesh.position.x,
					x2 = Camera.position.x,
					z1 = previewMesh.position.z,
					z2 = Camera.position.z;
				var angle = Math.atan((x1 - x2) / (z1 - z2));

				previewMesh.position.setX( planeIntersection[0].point.x );
				previewMesh.position.setZ( planeIntersection[0].point.z );
				previewMesh.rotation.set(0, angle, 0);

				if ( this.state.boxes.length ) {
					
					var bbPreview = new THREE.Box3().setFromObject(previewMesh);
					
					for ( let box in this.state.boxes ) {
						
						var bb = new THREE.Box3().setFromObject(this.state.boxes[box]);

						if ( bb.intersectsBox(bbPreview) ) {
							previewMesh.visible = false;
							break;
						}
					}
				}
			}

		}.bind(this));

		var previewGeo = new THREE.BoxGeometry(20, 10, 20);
		var previewMesh = new THREE.Mesh(previewGeo, new THREE.MeshLambertMaterial({
			opacity: 0.5,
			transparent: true
		}));
		previewMesh.position.setY(5);
		previewMesh.visible = this.state.placing;
		Scene.add(previewMesh);

		var mouseDown = {};

		window.addEventListener('mousedown', function() {
			mouseDown.x = mouse.x;
			mouseDown.y = mouse.y;
		});

		var newMaterial = new THREE.MeshLambertMaterial({
			color: '#f00'
		});

		canvas.addEventListener('mouseup', function() {

			if ( previewMesh.visible && mouse.x === mouseDown.x && mouse.y === mouseDown.y ) {

				var newMesh = previewMesh.clone();
				newMesh.material = newMaterial;
				Scene.add(newMesh);

				this.setState({ boxes: this.state.boxes.concat(newMesh) });
			}
		}.bind(this));

	}

	componentDidMount() {
		this.init.call(this);
	}

	clickShit(e) {
		var placing = this.state.placing;
		placing = !placing;
		this.setState({ placing });
	}

	render() {

		let styles = {
			
		};

		return (
			<div>
				<canvas ref="canvas" />
				<div className="button-group">
					<button style={styles} onClick={this.clickShit.bind(this)}>PLACE</button>
				</div>
			</div>
		);
	}
}

export default SceneComponent;