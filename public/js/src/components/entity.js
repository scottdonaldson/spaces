import { Point, distance, dot, length, unit } from './point';

let Entity = function(obj) {

	let location = Point({
		x: obj.x || 0,
		y: obj.y || 0,
		z: obj.z || 0
	});

	let direction = unit(Point()); // direction -- must be unit vector
	let setDirection = vector => direction = vector;

	let speed = 0; // assume no speed initially
	let acceleration = Point(); // assume no acceleration initially

	let angle = obj.angle;
	
	if ( angle && ( angle.x || angle.y || angle.z ) ) {
		setDirection(Point(angle));
	} else if ( angle ) {
		// radians
		angle *= Math.PI / 180;
		setDirection(Point({
			x: Math.cos(angle),
			z: Math.sin(angle)
		}));
	}

	let getLocation = () => location.clone();
	let getDirection = () => direction.clone();
	let getSpeed = () => speed;
	let getAcceleration = () => acceleration.clone();

	let setLocation = pt => location = Point(pt);
	let setSpeed = value => speed = value;
	let setAcceleration = function(pt) {
		// accepts a scalar (continue direction) or vector
		if ( isNaN(+pt) ) {
			acceleration = Point(pt);
		} else {
			acceleration = getDirection().scale(pt);
		}
	};

	let onTick = {};

	let start = function(target) {

		onTick._startstop = function() {
			if ( getSpeed() >= (target || 1) ) {
				setSpeed(target || 1);
				setAcceleration( Point() );
			} else {
				setAcceleration( getDirection().scale(0.01) );
			}
		};
	};

	let stop = function() {

		onTick._startstop = function() {
			if ( getSpeed() <= 0 ) {
				setSpeed(0);
				setAcceleration( Point() );
			} else {
				setAcceleration( getDirection().scale(-0.01) );
			}
		};
	};

	let tick = function(callback) {

		// based on current conditions (speed and direction), set new location
		// mutates location but not direction
		location.add( getDirection().scale(speed) );

		// set new direction and speed based on current acceleration
		setDirection( getDirection().add(acceleration) );
		setSpeed( speed + dot(acceleration, direction) );

		for ( let key in onTick ) {
			let cb = onTick[key];
			if (cb) cb();
		}

		// optional callback
		if (callback) callback();

	};

	// angles and turning take place in XZ plane
	let turn = function(deg) {

		deg *= Math.PI / 180;

		let { x, y, z } = getDirection();

		direction = Point({
			x: x * Math.cos(deg) - z * Math.sin(deg),
			y: y,
			z: x * Math.sin(deg) + z * Math.cos(deg)
		});
	};

	let getAngle = function(units) {

		let out = Math.atan(direction.x / direction.z);

		if ( !out || out === 'deg' || out === 'degrees') {
			out * 180 / Math.PI;
		}

		return out;
	};

	return {
		tick,
		onTick,
		start,
		stop,

		turn,
		getAngle,

		setLocation,
		setDirection,
		setSpeed,
		setAcceleration,

		getLocation,
		getDirection,
		getSpeed,
		getAcceleration
	};
};

export default Entity;