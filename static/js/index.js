var locationList;

var isMobile;
if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent)) {
	isMobile = true;
}
else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent)) {
	isMobile = true;
}
else {
	isMobile = false;
}

if (isMobile)
{
	fetch("/api/locations")
		.then(response => response.json())
		.then(data => buildForm(data));
}
else
{
	document.getElementById("setup").classList.toggle('hide');
	document.getElementById("desktopLanding").classList.toggle('hide');
}

async function buildForm(data)
{
	document.getElementById("part1").classList.toggle('hide');

	locationList = data;
	var selectLoc = document.getElementById("selectLoc");
	for (let key of Object.keys(data))
	{
		var opt = document.createElement('option');
		opt.value = key;
		opt.innerHTML = key;
		selectLoc.appendChild(opt);
	}
}

async function buildDest()
{
	var selectDest = document.getElementById("selectDest");
	const location = document.getElementById("selectLoc").value;

	for (let node of locationList[location].nodes)
	{
		var opt = document.createElement('option');
		opt.value = node.nodeName;
		opt.innerHTML = node.nodeName;
		selectDest.appendChild(opt);
	}

	document.getElementById("part1").classList.toggle('hide');
	document.getElementById("part2").classList.toggle('hide');
}