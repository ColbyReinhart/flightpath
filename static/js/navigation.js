import { Compass } from "/static/js/compass.js";
import { drawTarget } from "/static/js/utils.js";

//
// Globals
//

let userLat = 0;
let userLng = 0;
let locationName;
let destinationName;
let loc;
let nodeList;
let adjMat;
let settingUp = true;
let path = [];
let compass;
let canvas;
let video;
let geolocationWatchID;

const physical_screen_width = 8;
const physical_screen_distance = 20;
const fov = Math.atan2(physical_screen_width/2, physical_screen_distance) * 2;
let ctx;

//
// Helper methods
//

function buildGraph(position) {
	userLat = position.coords.latitude;
	userLng = position.coords.longitude;

	// Build path to destination
	const nodeListLength = nodeList.length;
	var destinationNode;
	var destNodeIndex;
	for (var i = 0; i < nodeListLength; ++i) {
		if (nodeList[i].nodeName == destinationName) {
			destinationNode = nodeList[i];
			destNodeIndex = i;
		}
	}

	var adj = checkAdjacency(destNodeIndex);
	if (adj.length == 0) {
		// This is a "lonely" node. Navigate straight to it
		path.push(destNodeIndex);
	}
	else {
		// This node is part of the graph. Find the shortest path
		// First we'll find the node closest to the user's current location
		// This will serve as the "start" node to reach our destination
		var closestNode = -1;
		var closestDist = 1000000;
		///document.getElementById("test").innerHTML += "<br>" + userLat + "," + userLng + "<br>";///
		for (var i = 0; i < nodeListLength; ++i) {
			const nodeLat = nodeList[i].lat;
			const nodeLng = nodeList[i].lng;
			const distance = dist(userLat, nodeLat, userLng, nodeLng);
			///document.getElementById("test").innerHTML += (i + ":" + distance + "<br>");///
			if (distance < closestDist) {
				closestNode = i;
				closestDist = distance;
			}
		}
		///document.getElementById("test").innerHTML += closestNode;///

		// Find the shortest path
		shortestPath(closestNode, destNodeIndex);
		///document.getElementById("test").innerHTML += "<br> path: " + path + "<br>";///
	}
}

let updateFailure = (err) => {
	console.warn(`ERROR(${err.code}): ${err.message}`);
}

let draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTarget(canvas, compass, fov);

    window.requestAnimationFrame(draw);
}

let updateGraphPosition = (position) => {
	if (dist(position.coords.longitude, nodeList[path[0]].lng, position.coords.latitude, nodeList[path[0]].lat) < 0.00009909909) { // 0.00009909909
		path.shift();
		if (path.length > 0) {
			compass.setDestination(nodeList[path[0]].lat, nodeList[path[0]].lng);
		} else {
			navigator.geolocation.clearWatch(geolocationWatchID);
			window.location.href= "success";
		}
	}
}

// Takes two integers indexing the node list
function shortestPath(startNode, endNode)
{
	// If the end node is lonely, navigate straight to it
	if (checkAdjacency(endNode).length == 0) {
		path.push(endNode);
		return;
	}

	// If the start node is lonely, navigate straight to the destination
	if (checkAdjacency(startNode).length == 0) {
		path.push(endNode)
		return;
	}

	path.push(startNode);

	// If the node we're looking for is already the nearst node, just navigate to it
	if (startNode == endNode)
	{
		return;
	}

	// keep track of which nodes have been traversed
	let traversed = [];
	for (let i = 0; i < nodeList.length; ++i)
	{
		traversed.push(false);
	}
	traversed[startNode] = true;

	let currentNode = startNode;
	while (currentNode != endNode)
	{
		// first find all nodes adjacent to current
		const adjacents = checkAdjacency(currentNode);

		// Check the for the destination and remove leaves
		for (let i = adjacents.length - 1; i >= 0 ; --i)
		{
			if (adjacents[i] == endNode)
			{
				path.push(endNode);
				return;
			}

			if(nodeList[adjacents[i]].isLeaf == "true")
			{
				elements.splice(i, 1);
			}
		}

		// Find the node which brings us closest to our destination (greedy method)
		let closestNode = -1;
		let closestDist = 1000000;
		const destNodeLat = nodeList[endNode].lat;
		const destNodeLng = nodeList[endNode].lng;
		for (let i = 0; i < adjacents.length; ++i)
		{
			if (traversed[adjacents[i]])
			{
				continue;
			}

			const candidateLat = nodeList[adjacents[i]].lat;
			const candidateLng = nodeList[adjacents[i]].lng;
			const distance = dist(destNodeLat, candidateLat, destNodeLng, candidateLng);

			if (distance < closestDist)
			{
				closestDist = distance;
				closestNode = adjacents[i];
			}
		}

		// Travel to the node with the shortest distance and mark it as traversed
		currentNode = closestNode;
		traversed[currentNode] = true;
		path.push(currentNode);
	}
}

async function getJsonData() {
	const json = await fetch("/api/locations");
	return await json.json();
}

function dist(x1, x2, y1, y2) {
	return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

// Display user camera feed
async function getMedia() {
	// let mediaStream = await navigator.mediaDevices.getUserMedia({
	// 	audio: false,
	// 	video: {
	// 		facingMode: {
	// 			ideal: 'environment'
	// 		}
	// 	}
	// });
	// var video = document.getElementById('feed');
	// video.srcObject = mediaStream;
	// video.onloadedmetadata = function (e) {
	// 	video.play();
	// };

	document.getElementById('streamControl').classList.toggle("hide");

	video = document.getElementById('feed');
	canvas = document.getElementById('canvas');
	ctx =  canvas.getContext("2d");

	const constraints = { audio: false, video: { facingMode: { ideal: 'environment' } } };
    let mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = mediaStream;
    let stream_width = mediaStream.getVideoTracks()[0].getSettings().width;
    let stream_height = mediaStream.getVideoTracks()[0].getSettings().height;
    let video_width = Math.min(stream_width, stream_height);
    let video_height = Math.max(stream_width, stream_height);
    let aspect = video_height/video_width;
    canvas.width = video_width;
    canvas.height = video_height;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${Math.round(window.innerWidth*aspect)}px`;
    video.style.width = `${window.innerWidth}px`;
    video.style.height = `${Math.round(window.innerWidth*aspect)}px`;
	video.onloadedmetadata = function() {
		video.play();
	};

	compass = new Compass(10);
	compass.init();
	compass.setDestination(nodeList[path[0]].lat, nodeList[path[0]].lng);

	draw();
}

// Return array of indices of adjacent nodes
function checkAdjacency(index) {
	var result = [];
	for (var i = 0; i < adjMat[index].length; ++i) {
		if (adjMat[index][i] == 1) {
			result.push(i);
		}
	}
	return result;
}

async function startProcess() {
	// Retrieve json data
	const jsonData = await getJsonData();
	// Parse json
	loc = jsonData[locationName];
	nodeList = loc.nodes;
	adjMat = loc.adjacency;

	// Get user's current position
	navigator.geolocation.getCurrentPosition((position) => {
		buildGraph(position);
		document.getElementById("streamControl").classList.toggle("hide");
	}, updateFailure, {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	});
}

//
// Global process
//

const streamButton = document.getElementById("streamButton");
streamButton.addEventListener("click", () => {
	getMedia();
	geolocationWatchID = navigator.geolocation.watchPosition(updateGraphPosition, updateFailure, {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	});
});

// Get query parameters
var paramList = [];
location.search.substr(1).split("&").forEach(function (param) {
	let paramName = param.split("=")[1];
	while (paramName.includes("+")) {
		paramName = paramName.replace("+", " ");
	}
	paramList.push(paramName);
});

locationName = paramList[0];
destinationName = paramList[1];

// Start the process
startProcess();