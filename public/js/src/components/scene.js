import React from 'react';
import ReactDOM from 'react-dom';
import THREE from 'three';
import OrbitControls from 'three-orbit-controls';

import { distance, mid, angle } from './point';
import Car from './car';
import Segment from './segment';

class SceneComponent extends React.Component {
	
	constructor() {
		super();

		this.state = { 
			t: 0,
			cars: [],
			keysdown: {}
		};
	}

	init() {

		let PAUSE = false;

		let _this = this;

		let Scene = new THREE.Scene();
		let cars = [];
		let segments = [];
		let objects = { cars: [], segments: [] };

		for ( let i = 0; i < 10; i++ ) {

			let position = {
				x: Math.random() * 50 - 100,
				z: Math.random() * 50 - 100,
				angle: Math.random() * 360
			};

			let car = Car(position, Scene);

			// :-)
			car.casualDrive();

			cars.push(car);

			let cube = new THREE.Mesh(
				new THREE.BoxGeometry(5, 5, 12),
				new THREE.MeshLambertMaterial({
					color: '#999'
				})
			);

			cube.position.set(position.x, position.y, position.z);

			objects.cars.push(cube);
			Scene.add(cube);
		}

		this.setState({ cars }, function() {
			window.car = _this.state.cars[0];
		});

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

		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		});

		var line = new THREE.Line( geometry, material );
		Scene.add( line );

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

		/* function renderSphere(x = 0, y = 0, z = 0) {
			let Sphere = new THREE.Mesh(
				new THREE.SphereGeometry(5, 12, 12),
				new THREE.MeshStandardMaterial({ 
					color: '#ee9',
					metalness: 0
				})
			);
			Sphere.position.set(x, y, z);
			Scene.add(Sphere);
		}

		renderSphere();
		renderSphere(50, 0, 50);
		renderSphere(100, 0, 0);

		renderSegment({ x: 50 }, { z: 50 });
		renderSegment({ x: -50 }, { z: 50 });
		renderSegment({ x: -50 }, { z: -50 });
		renderSegment({ x: 50 }, { z: -50 });
		renderSegment({}, { x: 100 });

		function renderSegment(pt1, pt2) {
			
			let segment = Segment(pt1, pt2);
			segments.push(segment);

			pt1 = segment.pt1;
			pt2 = segment.pt2;

			let street = new THREE.Mesh(
				new THREE.PlaneGeometry(distance(pt1, pt2), 10),
				new THREE.MeshLambertMaterial({ color: '#555', side: THREE.DoubleSide })
			);

			let m = mid(pt1, pt2),
				a = angle(pt1, pt2);
			street.rotation.set( -Math.PI / 2, 0, a - Math.PI / 2 );
			street.position.set(m.x, m.y, m.z); // flipping z and y since we rotate
			
			objects.segments.push(street);
			Scene.add(street);
		} */

		const canvas = ReactDOM.findDOMNode(this);

		let Camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		Camera.position.set(140, 50, 140);

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


		let render = function() {

			let t = _this.state.t;

			_this.setState({ t: t + 1 });
 
			_this.state.cars.forEach(function(car, i) {

				let q = Math.sin(t / 100);

				/* if ( i === 0 && car.getSpeed() > 0.2 ) {
					car.turn(0.5);
				}

				if ( t === 100 ) {
					car.start(2.5);
				} else if ( t === 500 ) {
					car.stop();
				} */

				if ( '38' in _this.state.keysdown ) {
					car.setAcceleration( 0.01 );
				}

				if ( '40' in _this.state.keysdown ) {
					car.setAcceleration( -0.01 );
				}

				if ( '37' in _this.state.keysdown ) {
					car.turn( -car.getSpeed() );
				}

				if ( '39' in _this.state.keysdown ) {
					car.turn( car.getSpeed() );
				}

				if ( car.getSpeed() >= 0.5 && !('40' in _this.state.keysdown) ) {
					car.setAcceleration();
				}

				// render car in 3d
				let loc = car.getLocation();
				objects.cars[i].position.set(loc.x, loc.y + 2.5, loc.z);
				objects.cars[i].rotation.set( 0, car.getAngle(), 0 );

				car.tick();
			});

			Renderer.render(Scene, Camera);

			if ( !PAUSE ) {
				window.requestAnimationFrame(render);
				// setTimeout(render, 50);
			}
		};

		render();

		function onResize() {
			Camera.aspect = window.innerWidth / window.innerHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize(window.innerWidth, window.innerHeight);
		}

		window.addEventListener('resize', onResize);

		window.addEventListener('keydown', function(e) {

			if ( e.keyCode === 32 ) {
				if ( PAUSE ) {
					PAUSE = false;
					render();
				} else {
					PAUSE = true;
				}
			}
		});
		/*
		window.addEventListener('keyup', function(e) {

			e.preventDefault();
			
			let keysdown = _this.state.keysdown;
			
			if ( e.keyCode in keysdown ) delete keysdown[e.keyCode];
			
			_this.setState({ keysdown });
		}); */

		// window.addEventListener('click', () => CLICKED = true);
	}

	componentDidMount() {
		this.init.call(this);
	}

	render() {
		return (
			<canvas />
		);
	}
}

export default SceneComponent;