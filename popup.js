

var apiUrl = 'https://research-pal-2.uc.r.appspot.com/notes' 
// 'https://research-pal-2.uc.r.appspot.com/notes'  not working
// 'http://research-pal-2.uc.r.appspot.com/notes'   not working
// 'http://research-pal.appspot.com/notes'           not working (golang 1.9 is depricated)
// 'http://localhost:8080/notes'                    working


function getCurrentTabUrl(callback) { //Question: what does callback hear mean?
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string'); //Question: does console.assert() going to work in chrome extensions?

    callback(url);
  });

}


function dosubmit(){
  var notes = document.getElementById('notes').value;
  var id = document.getElementById('notesid').value; //TODO: need a better way to store/retrieve the ID instead of in the html field
  
  getCurrentTabUrl(function(url) {

  if (id === undefined){ 
     postNotesData(encodeURIComponent(url),encodeURIComponent(notes), function(errorMessage) {
        renderStatus("create failed!!!", errorMessage)
    });
  }else{
    updateNotesData(encodeURIComponent(url),encodeURIComponent(notes),id, function(errorMessage) {
        renderStatus("save failed!!!", errorMessage)
    });
 }
  });

}



function postNotesData(url, notes, errorCallback){
 var postUrl = apiUrl;

  var x = new XMLHttpRequest();
  x.open('POST', postUrl);
  // x.setRequestHeader( 'Access-Control-Allow-Origin', '*'); 
  x.responseType = 'json';
  x.onload = function() { // Parse and process the response 

    var response = x.response;
    if (!response) { 

      errorCallback('No response from POST API!');
      return;
    }
    // var firstResult = response.Notes;
    // document.getElementById('notes').value = firstResult;
    
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  var body = '[{"url":"'+url+'","notes":"'+notes+'", "status":"new"}]';
  x.send(body);
  renderStatus("create successfully"); // TODO: need to check for the status /response of send to determine if the update is sucessful or not
}


function updateNotesData(url, notes, id, errorCallback){
  var patchUrl = apiUrl+"/"+id

  var x = new XMLHttpRequest();
  x.open('PATCH', patchUrl);
  // x.setRequestHeader( 'Access-Control-Allow-Origin', '*'); 
  x.responseType = 'json';
  x.onload = function() { // Parse and process the response 
    var response = x.response;
    if (!response) { 
      errorCallback('No response from PATCH API!');
      return;
    }
    // var firstResult = response.Notes;
    // document.getElementById('notes').value = firstResult;
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  var body = '{"notes":"'+notes+'"}';
  x.send(body);
  renderStatus("updated successfully"); // TODO: need to check for the status /response of send to determine if the update is sucessful or not

}


function getNotesData(searchTerm, errorCallback) {
  var searchUrl = apiUrl + '?url='+searchTerm;
	
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // x.setRequestHeader( 'Access-Control-Allow-Origin', '*'); 
  //x.setRequestHeader( 'Content-Type', 'application/json' );
  x.responseType = 'json';
  x.onload = function() { // Parse and process the response 
    var response = x.response;
    // // enable this when debugging an issue
    // if (!response) { 
    //   errorCallback('No response from GET API!');
    //   //document.getElementById('postButton').value="Create"
    //   return;
    // }
    // if (response.length ===0){
    //    errorCallback('Zero response from API!');
    //   return;
    // }

    document.getElementById('notes').value = decodeURIComponent(response[0].notes);
    document.getElementById('notesid').value = response[0].id;

  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
  setTimeout(function(){ document.getElementById('status').textContent = ""; }, 60000); 
}


document.addEventListener('DOMContentLoaded', function() { //Question: what is the significance of this pattern of calling function in nested manner in javascript?
  getCurrentTabUrl(function(url) {
    
    //renderStatus(url);
    //renderStatus(encodeURIComponent(url));
    getNotesData(encodeURIComponent(url), function(errorMessage) {
      renderStatus(errorMessage);
    });
  });

  var postButton = document.getElementById('postButton');
  postButton.addEventListener('click', function() {
    dosubmit();
  }, false); //Question: what is this false doing here?
});
