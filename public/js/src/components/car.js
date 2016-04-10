import _ from 'lodash';
import { Point, distance } from './point';
import { Line, closestPointOnLine, angle } from './line';
import Entity from './entity';

let Car = function(obj, Scene) {

	let entity = Entity(obj),
		drive = entity.tick,
		t = 0,
		state = {
			angle: null,
			direction: null,
			speed: null
		};

	entity.onTick.increment = () => t++;

	entity.onTick.stateHandler = function() {

		state.direction = entity.getDirection();
		state.speed = entity.getSpeed();
		state.acceleration = entity.getAcceleration();

	};

	let trajectory = function() {

		let location = entity.getLocation(),
			direction = entity.getDirection(),
			next = location.clone().add(direction);

		let l = Line(location, next);
		// let closest = closestPointOnLine(Point(), l);
		let m = Line(location, Point());
		let theta = angle(l, m);
		// console.log(Math.atan(closest.z / closest.x) * 180 / Math.PI);
	};

	let casualDrive = function() {

		let targetSpeed = 0.35;

		entity.onTick.casualDrive = function() {

			let s = state.speed,
				a = state.acceleration,
				dir = state.direction,
				d = distance(entity.getLocation(), Point());

			// try to maintain targetSpeed
			if ( s < targetSpeed ) {
				entity.setAcceleration( dir.scale(0.01) );
			} else if ( s > targetSpeed ) {
				entity.setAcceleration( dir.scale(-0.01) );
			} else {
				entity.setAcceleration( dir.scale(0) );
			}
			
			if ( d > 120 ) {
				entity.turn(0.5);
			}

			// trajectory();
		};

		window.addEventListener('click', function() {

			targetSpeed = Math.random();
			console.log('target speed is now', targetSpeed);

		});
	};

	return _.assign({
		drive,
		casualDrive
	}, entity);

};

export default Car;