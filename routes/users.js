var express = require('express');
const { roles } = require("./roles")
var router = express.Router();

/* GET users listing. */
router.get('/api', function (req, res, next) {
	let data = { ...roles }
	if (req.query.text) {
		// const temp = roles.body.filter(x=>x.job_title.toLocaleLowerCase().includes(req.query.text.toLocaleLowerCase()))
		let filteredData = fiterData(req.query.text, roles.body, 'job_title')
		data.body = filteredData
	}
	res.json(data)

});

function fiterData(term, dataList, searchKey) {
	var exact_word_match_results = []
	var search_word_match_results = []
	var word_index_match_results = []
	var ordered_inclusive_results = []
	var abbrevation_search_results = []

	let termsArray = term.split(' ');
	let searchTerm = term.trim();
	// Find exact word results 
	exact_word_match_results = dataList.filter((v) => (v[searchKey].toLowerCase()) === searchTerm.trim().toLowerCase())

	// Indexed word match search code..
	let word_indexed_results = dataList.filter((v) => (v[searchKey].toLowerCase()).indexOf(searchTerm.toLowerCase()) >= 0);
	let index_wise_results = []
	word_indexed_results?.forEach((v) => {
		let index = (v[searchKey].toLowerCase()).indexOf(searchTerm.toLowerCase())
		if (index >= 0) {
			// console.log(`index: ${index}: ${v}`)
			if (!index_wise_results[index]) {
				index_wise_results[index] = []
			}
			index_wise_results[index].push(v)
			index_wise_results[index].sort()
		}
	})
	if (index_wise_results && index_wise_results.length) {
		index_wise_results = index_wise_results.filter((roleArr) => roleArr.length > 0)
		// console.log('index_wise_results', index_wise_results)
		var merged_index_wise_results = index_wise_results.reduce((prev, next) => {
			return prev.concat(next);
		}, []);
		// console.log('merged index_wise_results', merged_index_wise_results)
		word_index_match_results = merged_index_wise_results;
	}
	// console.log(word_index_match_results)




	let temrmWordsArray = termsArray.filter((word) => word.trim() !== '')
	if (term === '' && temrmWordsArray.length == 0) {
		// If user removes the search word
		return []
	} else {
		// If user enters multiple words
		search_word_match_results = [];
		abbrevation_search_results = [];
		ordered_inclusive_results = [];

		temrmWordsArray?.forEach((searchWord) => {
			dataList.forEach((role) => {
				// Abbrevation Search code.....
				let abbrevation = getAbbrevationOfRole(role[searchKey]);
				if (abbrevation.indexOf(searchWord.toLowerCase()) > - 1) {
					abbrevation_search_results.push(role)
				}
			})
			// Boolean Inclusive Search code.....
			let filteredTitles = dataList.filter((v) => v[searchKey].toLowerCase().indexOf(searchWord.trim().toLowerCase()) > -1)
			search_word_match_results.push(...filteredTitles)
			filteredTitles.forEach((role) => {
				let roleWordArray = role[searchKey].split(' ').map(eachWord => eachWord.toLowerCase());
				let index = roleWordArray.indexOf(searchWord.toLowerCase())
				if (index > -1) {
					if (!ordered_inclusive_results[index]) {
						ordered_inclusive_results[index] = [];
					}
					ordered_inclusive_results[index].push(role);
					ordered_inclusive_results[index].sort()
				}
			})
		})
	}

	let finalArray = [];

	if (exact_word_match_results && exact_word_match_results.length > 0) {
		finalArray.push(...exact_word_match_results)
	}

	if (word_index_match_results && word_index_match_results.length > 0) {
		finalArray.push(...word_index_match_results)
	}

	ordered_inclusive_results?.forEach((arr) => {
		finalArray.push(...arr)
	});

	if (search_word_match_results && search_word_match_results.length > 0) {
		finalArray = finalArray.concat(search_word_match_results)
	}

	if (abbrevation_search_results && abbrevation_search_results.length > 0) {
		finalArray = finalArray.concat(abbrevation_search_results?.sort())
	}

	if (finalArray.length) {
		return [...new Set(finalArray)];
	} else {
		return [];
	}
}

function getAbbrevationOfRole(role) {
	if (role == '') {
		return ''
	}
	var matches = role.match(/\b(\w)/g);
	var acronym = matches.join('').toLowerCase();
	return acronym;
}

module.exports = router;
