const minute = 1000 * 60;
const hour = minute * 60;

let manifest = chrome.runtime.getManifest();
console.log(`${manifest.short_name} - Yahoo! Fantasy Football Picker - ${manifest.version}`);

loadWebResource('webActions.js');

if (location.pathname.match(/\/grouppicks$/)) {
	/*
	 * Add up the score of the Group Picks
	 */
	console.log(`${manifest.short_name} - Grouppicks`);
	GroupPicksKeepScore()
} else if (location.pathname.match(/\/pickem\/\d+\/\d+$/) || location.pathname.match(/\/picks$/)) {
	/*
	 * Wait for the Pick'em page to load
	 */
	Loading();
} else {
	console.log(`${manifest.short_name} - No Action`);
}

function Loading(cb)
{
	let debug = 1;
	if (debug)
		console.log(`${manifest.short_name} - Loading`);
	let max_tries = 20;
	var tries = 20;
	var sleep_time = 50;
	var pending = setInterval(function()
	{
		tries--;

		let saveButton = false;
		let loading = document.getElementsByClassName('ysf-cta-save');

		/*
		 * Look for the Save Button
		 */
		[...loading].forEach((e) => {
			if (e.innerText == 'Save Picks') {
				saveButton = true;
			}
		});

		if (saveButton) {
			clearInterval(pending);
			if (debug)
				console.log(`Loaded after ${max_tries - tries} tries.`);
			Loaded(loading);
		} else {
			if (debug)
				console.log(`Loading... ${tries} tries left for '${cb}' - Sleep time ${sleep_time}`);
		}
		
		// Timedout
		if (tries == 0) {
			console.log('Status timedout');
			clearInterval(pending);
		}
	}, sleep_time);
}

function Loaded(elements)
{
	console.log(`${manifest.short_name} - Loaded`);


	[...elements].forEach((e) => { 
		if (e.innerText == 'Save Picks') {
			console.log(`Match - ${e.innerText}`);
			addAutoPickButton(e);
		} else {
			console.log(`Skip - ${e.innerText}`);
		}
	});

	// Cache Weekly Games
	GetGameTimes();
}

function loadWebResource(filename)
{
 	// Inject Javascript into main document
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL(filename);
	s.onload = function() {
		this.parentNode.removeChild(this);
	};
	(document.head||document.documentElement).appendChild(s);
}

// Add a hint for the Srclocation
let pickSrc = document.createElement('input');
pickSrc.setAttribute('type', 'hidden');
pickSrc.setAttribute('id', 'pick-o-Src');
pickSrc.setAttribute('value', chrome.runtime.getURL(''));
document.getElementsByTagName('body')[0].appendChild(pickSrc);

function addAutoPickButton(element)
{
	let button = document.createElement('a');
	button.setAttribute('name', 'Pick-O-Auto-Pick');
	button.setAttribute('href', 'javascript:void(0);');
	button.setAttribute('onclick', "checkUnderdogs()");
	button.setAttribute('class', 'ysf-cta ysf-cta-small ysf-cta-in-page-submit');
	button.innerText = 'Auto-Pick';

	element.parentElement.insertBefore(button, element);
}

function GetCurrentWeek()
{
	let week = '';
	if (location.pathname.match(/grouppicks/)) {
		week = document.getElementById('ysf-grouppicks-week-nav-tabs').getElementsByClassName('selected')[0].innerText.trim();
	} else {
		week = document.getElementsByClassName('selected')[0].innerText.trim();
	}
	return (parseInt(week));
}

function GetGameTimes()
{
	let zone = '';
	let match = document.getElementsByClassName('status')[0].innerText.match(/\((\w+)\)/);
	if (match) {
		zone = match[1];
	}

	let week = GetCurrentWeek();
	let month_map = {
		"01" : "Jan",
		"02" : "Feb",
		"03" : "Mar",
		"04" : "Apr",
		"05" : "May",
		"06" : "Jun",
		"07" : "Jul",
		"08" : "Aug",
		"09" : "Sep",
		"10": "Oct",
		"11" : "Nov",
		"12" : "Dec"
	};
	let teams = {
		"Arizona" 	: "Ari",
		"Atlanta" 	: "Atl",
		"Baltimore" 	: "Bal",
		"Buffalo" 	: "Buf",
		"Carolina" 	: "Car",
		"Chicago" 	: "Chi",
		"Cincinnati" 	: "Cin",
		"Cleveland" 	: "Cle",
		"Dallas" 	: "Dal",
		"Denver" 	: "Den",
		"Detroit" 	: "Det",
		"Green Bay" 	: "GB",
		"Houston" 	: "Hou",
		"Indianapolis" 	: "Ind",
		"Jacksonville" 	: "Jax",
		"Kansas City" 	: "KC",
		"Las Vegas" 	: "LV",
		"Los Angeles (LAC)": "LAC",
		"Los Angeles (LAR)": "LAR",
		"Miami" 	: "Mia",
		"Minnesota" 	: "Min",
		"New England" 	: "NE",
		"New Orleans" 	: "NO",
		"New York (NYJ)": "NYJ",
		"New York (NYG)": "NYG",
		"Philadelphia" 	: "Phil",
		"Pittsburgh" 	: "Pit",
		"San Francisco" : "SF",
		"Seattle" 	: "Sea",
		"Tampa Bay" 	: "TB",
		"Tennessee" 	: "Ten",
		"Washington" 	: "Was"
	};
	let GameTimes = {};

	let cache = localStorage.getItem(`Week-${week}`);
	if (cache) {
		GameTimes = JSON.parse(cache);
	}

	let date = new Date();
	let games = document.getElementsByClassName('matchup');
	[...games].forEach((game) => {
		let td = game.getElementsByTagName('td');

		let game_time = td[td.length - 2].innerText;
		let match = game_time.match(/(\w{3})\s(\d+)\/(\d+)\s(.*?)$/);

		if (match) {
			let dow = match[1];
			let month = match[2];
			let day = parseInt(match[3]);
			let year = date.getFullYear();
			let timeofday = match[4];

			// Roll the new year
			if (month < date.getMonth()) {
				year++;
			}

			game_time = `${dow} ${month_map[month]} ${day} ${year} ${timeofday} ${zone}`;
		} else {
			console.log(`Can't parse the time of the game`);
			return;
		}

		let home = '';
		let away = '';
		if (td[1].innerText.match('@')) {
			home = td[1].innerText.replace('@', '');
			away = td[5].innerText.replace('@', '');
		} else  if (td[5].innerText.match('@')) {
			home = td[5].innerText.replace('@', '');
			away = td[1].innerText.replace('@', '');
		} else {
			alert('Error: no home or away');
		}

		//console.log(`Week-${week} -- Home: '${home}' Game Time: ${game_time}`);
		GameTimes[teams[home]] = { home, away, game_time };
		GameTimes[teams[away]] = { home, away, game_time };

	});
	localStorage.setItem(`Week-${week}`, JSON.stringify(GameTimes));
}

/*
 * Helper function to sum up the spread points
 */
function GroupPicksGetRowStats(id)
{

	let row = [...document.getElementsByName('pick-o-rows')].filter((element) => {return (element.getAttribute('pick-o-row-id') == id)});
	if (row.length == 1) {
		let td = row[0].getElementsByTagName('td');
		let picked_points = 0;
		let games = 0;
		let incorrect = 0;
		let correct = 0;
		[...td].forEach((r, index) => {
			games = index - 1;					// Keep track of the number of games
			if (r.getAttribute('name') == 'pick-o-nopick') {
				//console.log(`\t${id}: Stats: No Pick `);
				return;
			}

			let match = r.innerText.match(/\((\d+)\)/);
			if (match) {
				picked_points += parseInt(match[1]);		// Sum of Correct & Incorrect + Pushes

				if (r.className == 'incorrect' || r.className.match(/incorrect/)) {
					incorrect += parseInt(match[1]);
					//console.log(`\t${id}: Incorrect: '${parseInt(match[1])}'`);
				} else if (r.className == 'correct' || r.className.match(/\scorrect/)) {
					correct += parseInt(match[1]);
					//console.log(`\t${id}: Correct: '${parseInt(match[1])}'`);
				} else if (r.getAttribute('name') == 'pick-o-push') {
					/*
				 	* For a 'push', that means it is an incorrect score.
				 	* For game not played yet, then do nothing.
				 	*/
					incorrect += parseInt(match[1]);
					//console.log(`\t${id}: Incorrect - Push: '${parseInt(match[1])}'`);
				} else {
					//console.log(`\t${id}: Class Matches Name: '${r.className}'`);
				}
			}
		});
		let max_points = games * (games + 1) / 2;	
		let possible = max_points - incorrect;
		/*
		 * If you don't pick any points your potential is zero.
		 * This can happen for games in the future.
		 */
		if (picked_points == 0) {
			possible = 0;
		}
		/*
		 * max_points == maximum total points, sum of all games
		 * picked_points == sum of correct & Incorrect + pushes, ignoring no scores
		 */
		return ({id, max_points, picked_points, correct, incorrect, possible, games});
	}
}

function GroupPicksKeepScore()
{
	let rows = document.getElementsByTagName('tr');
	let rowIndex = -1;

	//console.log(`${arguments.callee.name}()`);

	let week = GetCurrentWeek();
	let GameTimes = localStorage.getItem(`Week-${week}`);
	if (GameTimes) {
		GameTimes = JSON.parse(GameTimes);
	} else {
		console.log(`Can't get Game Times for week '${week}'`);
		GameTimes = {};
	}

	[...rows].forEach((r, index) => {
		if (r.innerText.match(/^Team Name.Points$/)) {
			rowIndex = index;
		}
	});

	/*
	 * Check for game pushes, the first pass any class that is blank
	 * is a possible 'push'. However, you will need to make another pass
	 * over the rows to find the games that are not played yet
	 */
	let scores = [...rows].slice(rowIndex);
	for (var i = 1; i < scores.length; i++) {
		scores[i].setAttribute('name', 'pick-o-rows');
		let td = scores[i].getElementsByTagName('td');
		for (var n = 0; n < td.length; n++) {
			let game_time = undefined;

			// Make it easier to identify the row
			if (n == 0) {
				scores[i].setAttribute('pick-o-row-id', td[0].innerText);
				continue;
			}
			// Skip the Sum column
			if (td[n].className == 'sum') {
				continue;
			}
			// Set the Game Time
			let match = td[n].innerText.match(/^(\w+)\n\(\d+\)/m);
			if (match) {
				if (GameTimes.hasOwnProperty(match[1])) {
					game_time = GameTimes[match[1]].game_time;
					td[n].setAttribute('title', `Game Time: ${game_time}`);
					td[n].setAttribute('game_time', `${game_time}`);
				}

			}
			// Set possible push
			if (!td[n].className.match(/correct/)) {
				/*
				 * If game is inprogress continue
				 */
				if (game_time) {
					/*
					 * This could trigger a false positive on true game pushes,
					 * but only up to 4 hours
					 */
					let start = Date.parse(game_time);
					let end = Date.parse(game_time) + (hour * 4);
					let now = Date.now(); 
					//console.log(`Game Start: '${start}', Game End: '${end}', Now: '${now}'`);
					//console.log(`-----------------------------------------------------------------`);

					if ((start < now) && (now < end)) {
						//console.log(`\tGame inprogress`);
						td[n].setAttribute('game_status', 'pick-o-inprogres');
						continue;
					} else if (start > now) {
						//console.log(`\tGame not started`);
						td[n].setAttribute('game_status', 'pick-o-not-started');
						continue;
					}
				}
				if (td[n].innerText.match(/\(\d+\)/)) {
					//console.log(`Possible push - '${td[n].innerText}'`);
					td[n].setAttribute('name', 'pick-o-push');
				} else if (td[n].innerText.trim() == '') {
					//console.log(`No Pick`);
					td[n].setAttribute('name', 'pick-o-nopick');
				} else {
					//console.log(`Unknown Case - '${td[n].className}' -- ${td[n].innerText}`);
				}
			} else {
				td[n].setAttribute('game_status', 'pick-o-finished');
			}
		}
	}

	let gamesNotPlayedYet = [];
	// Find the games not played yet
	for (var i = 1; i < scores.length; i++) {
		let td = scores[i].getElementsByTagName('td');
		for (var n = 0; n < td.length; n++) {
			if (td[n].innerText == '--') {
				/*
				 * Keep track of the column where a game is not
				 * played yet.
				 */
				gamesNotPlayedYet.push(n);
				td[n].setAttribute('game_status', 'pick-o-not-started');
			}
		}
	}

	/*
	 * Now that we know which games have not been played yet,
	 * then remove the games not played.
	 */
	for (var m = 0; m < gamesNotPlayedYet.length; m++) {
		let column = gamesNotPlayedYet[m];
		for (var i = 1; i < scores.length; i++) {
			let td = scores[i].getElementsByTagName('td');
			/*
			 * Clear the possible 'push' because the game has not
			 * been played yet.
			 */
			td[column].removeAttribute('name');
		}
	}

	// Tally all the scores
	scores.forEach((score, index) => {
		// Add Sorting
		if (index == 0) {
			score.getElementsByTagName('th')[1].innerHTML = `
				<a style="font-size:1.5em" href="javascript:void(0);" onclick="SortScores(this, true);">&#8691;</a>
				<span style="margin-left:10px;">Points</span>
				<span style="margin-left:5px; margin-right:5px;">-</span>
				<span style="margin-right:10px;">Possible Pts.</span>
				<a style="font-size:1.5em" href="javascript:void(0);" onclick="SortScoresTotal(this, true);">&#8691;</a>
				`;
			return;
		}

		let id = score.getAttribute('pick-o-row-id');
		let stats = GroupPicksGetRowStats(id);
		let td = score.getElementsByTagName('td');
		// EVAN
		[...td].forEach((r, index) => {
			if (r.className == 'sum') {
				// Track the scores for Sorting
				r.setAttribute('pick-o-score-correct', stats.correct);
				r.setAttribute('pick-o-score-possible', stats.possible);
				r.setAttribute('pick-o-score-stats', JSON.stringify(stats));
				r.setAttribute('title', `Original Points - '${r.innerText}: ${JSON.stringify(stats)}'`);
				//r.innerText = `${stats.correct} - ${stats.possible}`;
				r.innerText = `${stats.correct} - ${stats.possible}`;
				return;
			}
		});
	});
}
