
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function checkUnderdogs()
{
	let teams = 0;

	// Need to toggle favorites first
	let favorite = document.getElementsByClassName('favorite-win');
	[...favorite].forEach((f) => {
		if (f.firstChild.tagName == 'INPUT') {
			f.firstChild.click();
		}
	});

	let underdogs = document.getElementsByClassName('underdog-win');
	[...underdogs].forEach((u) => {
		if (u.firstChild.tagName == 'INPUT') {
			u.firstChild.click();
			teams++;
		}
	});

	selectConfidenceScore(teams);
}

function selectConfidenceScore(teams)
{
	let confScore = document.getElementsByClassName('conf-score');

	// Build the array
	let confidenceScore = [];
	for (i = 0; i < teams; i++) {
		confidenceScore.push(i + 1); 
	}
	

	shuffleArray(confidenceScore);

	[...confScore].forEach((select) => {
		let c = confidenceScore.pop();
		select.firstChild.selectedIndex = c;
		select.firstChild.selected = true;
	});
}

function SortScores(element, order)
{
	let debug = 0;

	if (debug)
		console.log(`SortScores(${element}, order)`);

	let tbody = document.getElementsByTagName('tbody')[0];
	let rows = document.getElementsByName('pick-o-rows');
	if (debug)
		console.log(`\tRows: ${rows.length}`);

	// Make a copy and remove the elements to be sorted
	let copy = [];
	for (var i = rows.length - 1; i >= 0; i--) {
		copy.push(rows[i].cloneNode(true));
		rows[i].parentNode.removeChild(rows[i]);
	}

	// Sort it back
	[...copy].sort(function (A, B) {
		let a = A.lastChild.getAttribute('pick-o-score-correct');
		let b = B.lastChild.getAttribute('pick-o-score-correct');

		if (order) {
			return (parseInt(a) - parseInt(b));
		} else {
			return (parseInt(b) - parseInt(a));
		}
	}).forEach((row, index) => {
		tbody.appendChild(row);						// Add the sorted rows back
	});

	//if (element.getAttribute('onclick') == `${arguments.callee.name}(this)`) {
	if (order == true) {
		element.setAttribute('onclick',`${arguments.callee.name}(this)`);
	} else {
		element.setAttribute('onclick',`${arguments.callee.name}(this, true)`);
	}
}

function SortScoresTotal(element, order)
{
	let debug = 0;

	if (debug)
		console.log(`SortScores(${element}, order)`);

	let tbody = document.getElementsByTagName('tbody')[0];
	let rows = document.getElementsByName('pick-o-rows');
	if (debug)
		console.log(`\tRows: ${rows.length}`);

	// Make a copy and remove the elements to be sorted
	let copy = [];
	for (var i = rows.length - 1; i >= 0; i--) {
		copy.push(rows[i].cloneNode(true));
		rows[i].parentNode.removeChild(rows[i]);
	}

	// Sort it back
	[...copy].sort(function (A, B) {
		let a = A.lastChild.getAttribute('pick-o-score-possible');
		let b = B.lastChild.getAttribute('pick-o-score-possible');

		if (order) {
			return (parseInt(a) - parseInt(b));
		} else {
			return (parseInt(b) - parseInt(a));
		}
	}).forEach((row, index) => {
		tbody.appendChild(row);						// Add the sorted rows back
	});

	if (order == true) {
		element.setAttribute('onclick',`${arguments.callee.name}(this)`);
	} else {
		element.setAttribute('onclick',`${arguments.callee.name}(this, true)`);
	}
}

