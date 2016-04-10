const Point = function(obj = {}) {

	let x = obj.x || 0,
		y = obj.y || 0,
		z = obj.z || 0;

	function add(obj) {
		return Point({
			x: x += (obj.x || 0),
			y: y += (obj.y || 0),
			z: z += (obj.z || 0)
		});
	}

	function subtract(obj) {
		return Point({
			x: x -= (obj.x || 0),
			y: y -= (obj.y || 0),
			z: z -= (obj.z || 0)
		});
	}

	function scale(factor) {
		return Point({
			x: x *= factor,
			y: y *= factor,
			z: z *= factor
		});
	}

	function clone() {
		return Point({
			x, y, z
		});
	}

	function log(i = 2) {
		let r = n => Math.round(n * Math.pow(10, i)) / Math.pow(10, i);
		console.log(r(x), r(y), r(z));
	}

	let out = { add, subtract, scale, clone, log };

	Object.defineProperty(out, 'x', { get: () => x });
	Object.defineProperty(out, 'y', { get: () => y });
	Object.defineProperty(out, 'z', { get: () => z });

	return out;

};

const mid = function(pt1, pt2) {

	function mean(a, b) {
		return ( a + b ) / 2;
	}

	return Point({
		x: mean(pt1.x, pt2.x),
		y: mean(pt1.y, pt2.y),
		z: mean(pt1.z, pt2.z)
	});

};

// angle operates in XZ plane only
const angle = function(pt1, pt2) {

	let a = Math.atan( (pt1.x - pt2.x) / (pt1.z - pt2.z) );
	return a;

};

const distance = function(pt1, pt2) {

	if ( !pt1 || !pt2 ) return null;

	let x = pt2.x - pt1.x,
		y = pt2.y - pt1.y,
		z = pt2.z - pt1.z;

	x = Math.pow(x, 2);
	y = Math.pow(y, 2);
	z = Math.pow(z, 2);

	let d = Math.sqrt(x + y + z);

	return d;

};

const dot = function(pt1, pt2) {

	return (pt1.x * pt2.x) + (pt1.y * pt2.y) + (pt1.z * pt2.z);

};

const length = function(pt) {

	return distance(Point(), pt);

};

const unit = function(pt) {

	let f = length(pt);

	return Point({
		x: f !== 0 ? pt.x / f : 1,
		y: f !== 0 ? pt.y / f : 0,
		z: f !== 0 ? pt.z / f : 0
	});
};

const deg = function(radians) {
	return radians * 180 / Math.PI;
};

const rad = function(degrees) {
	return degrees * Math.PI / 180;
};

export {
	Point,
	mid,
	angle,
	distance,
	dot,
	length,
	unit,
	deg,
	rad
};