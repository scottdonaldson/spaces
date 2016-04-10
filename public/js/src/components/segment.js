import { Point, distance, length, unit } from './point';

let Segment = function(one, two, opts) {

	let pt1 = Point(one),
		pt2 = Point(two),
		entities = [];

	function addEntity(entity) {
		entities.push(entity);
	}

	function removeEntity(entity) {
		entities.splice(entities.indexOf(entity), 1);
	}

	return {
		pt1,
		pt2,
		addEntity,
		removeEntity
	};
};

export default Segment;