var pageDOIs=document.body.innerHTML.match(/\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&\'<>])\S)+)\b/gi);
pageDOIs = $.unique(pageDOIs);
if(window.location.hostname != "pubpeer.com" && pageDOIs.length > 0){
	var storedDOIs=localStorage.getItem("storedDOIs");
	var dotcom = "devkey=PubMedChrome";
	var IDsURL = "http://api.pubpeer.com/v2/pubposts?filter=doi&"+dotcom;

	if(!storedDOIs || storedDOIs.length < 10){
		var idRequest = new XMLHttpRequest();
		idRequest.onload = setAllDOIs;
		idRequest.open("get", IDsURL, false);
		idRequest.send();
	}
	var LastIDdownload=localStorage.getItem("LastIDdownload");
	if(!LastIDdownload){
		LastIDdownload = Date.now();
	}
	if(((Date.now() - LastIDdownload)/3600000) > 168){
		var idRequest = new XMLHttpRequest();
		idRequest.onload = setAllDOIs;
		idRequest.open("get", IDsURL, false);
		idRequest.send();
	}

	function setAllDOIs(){
		localStorage.setItem("storedDOIs", this.responseText);
		storedDOIs = this.responseText;
		localStorage.setItem("LastIDdownload", String(Date.now()));
	}
	function getDetails(){
		var articleRequest = new XMLHttpRequest();
		articleRequest.onload = getPpJson;
		articleRequest.open("get", address, false);
		articleRequest.send();
	}
	function getPpJson(){
		json = $.parseJSON(this.responseText);
	}

	var allDOIs = $.parseJSON(storedDOIs);
	

	var matchedPageDOIs = new Array();
	var doisPpLink = "";
	for(i=0; i<pageDOIs.length; i++){
		if(allDOIs.dois.indexOf(pageDOIs[i]) != -1){
			matchedPageDOIs.push(pageDOIs[i]);
			doisPpLink += pageDOIs[i] + ";";
		}
	}

	if(matchedPageDOIs.length > 0){
		var address = "http://api.pubpeer.com/v2/publications/" + doisPpLink + "?" + dotcom;
		getDetails();
	}


	for(i=0; i<matchedPageDOIs.length; i++){
		var total_comments = json.feedbacks[i].total_comments;
		if(total_comments == 1){
			hrefText = "1 comment on PubPeer";
		} else if(total_comments > 1){
			hrefText = total_comments + " comments on PubPeer";
		}
		var linkToComments = json.feedbacks[i].url + "?utm_source=Chrome&utm_medium=ChromeExtension&utm_campaign=Extensions";
		
		var tagElements = ":contains("+matchedPageDOIs[i]+")";
		var unsortedDoiElements = $(tagElements);
		var aDoiElement = [];
		if(unsortedDoiElements.length>0){
			for(m=0; m<unsortedDoiElements.length; m++){
				var allParents = $(unsortedDoiElements[m]).parents().length
				aDoiElement.push({element:unsortedDoiElements[m], rents:allParents});
			}
			aDoiElement.sort(function(a,b){
				return b.rents - a.rents;
			});
		}
		var elementsWithDois = aDoiElement.length
		for(k=0; k<elementsWithDois; k++){	//try each element that contains a matched DOI
			var pp_commClass = document.getElementsByClassName('pp_comm');
			var elementsAdded = pp_commClass.length;
			var anyAlreadyAdded = false;
			for(l=0; l == 0 || l<elementsAdded; l++){	//check if an existing tag is nested below the element
				var alreadyAdded = $.contains(aDoiElement[k].element, pp_commClass[l]);
				if(alreadyAdded == true){
					anyAlreadyAdded = true;
				}
			}
			if(!anyAlreadyAdded){
				$(aDoiElement[k].element).append(
					$("<p>", { class: "pp_comm" })
						.append($("<a>", { href: linkToComments, style: "color: rgb(255,255,255); text-decoration: none; font-weight: bold; margin-left: 1em", text: hrefText}))
						.css("background", "#ff9e29")
				);
			}
		}
	}
}
