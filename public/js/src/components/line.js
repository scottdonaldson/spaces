import { Point, dot, length, deg, rad } from './point';

let Line = function(a, b) {

	var point = Point(a),
		slope,
		intercept;

	// point-point
	if ( isNaN(+b) ) {
		b = Point(b);
		slope = b.x !== a.x ? ( b.z - a.z ) / ( b.x - a.x ) : Infinity;
	// point-slope
	} else {
		slope = b;
	}

	intercept = slope !== Infinity ? -1 * slope * a.x : null;

	var output = function(x, inv) {
		if ( inv ) return ( x - intercept ) / slope;
		return slope !== Infinity ? slope * x + intercept : null;
	};

	output._point = Point(point);
	output._slope = slope;
	output._intercept = Point({
		x: intercept
	});

	return output;
};

var intersection = function(line1, line2) {

	if ( line1._slope === line2._slope ) return null;

	let m1 = line1._slope,
		m2 = line2._slope,
		b1 = line1._intercept.x,
		b2 = line2._intercept.x;

	let x = (b2 - b1) / (m1 - m2),
		z = m1 * x + b1;

	return Point({ x, z });
};

var angle = function(line1, line2) {

	// TODO
	if ( line1._slope === line2._slope ) return 0;

	let n1 = Point({
			x: 1,
			z: line1._slope
		}),
		n2 = Point({
			x: 1,
			z: line2._slope
		});

	let theta = dot(n1, n2) / ( length(n1) * length(n2) );
	
	console.log(Math.round(dot(n1, n2) / ( length(n1) * length(n2) ) * 10) / 10, Math.round(deg(theta) * 10) / 10);
	
	theta = Math.acos(theta);
	//console.log(deg(theta));

	return theta;
};

var closestPointOnLine = function(pt, line) {
	var slope = -1 / line._slope,
		perpLine = Line(pt, slope);
	
	return intersection(line, Line(pt, slope));
};

export {
	Line,
	intersection,
	angle,
	closestPointOnLine
};