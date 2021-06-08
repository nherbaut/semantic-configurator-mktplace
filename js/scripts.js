function renderHello() {
  
}

renderHello();
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


function onSelectChange(evt){
    evt.target.disabled=true;
    var uuid=evt.target.getAttribute("selectedChild");
    var database=evt.target.getAttribute("database");
    
  
    var child_select = document.getElementById(uuid);
    console.log(child_select);
    var callback = function(){
    child_select.parentElement.style.display="block";
    }

    loadSemanticData(evt.target.selectedOptions[0].getAttribute("value"),uuid,database,callback);
}

function semanticDataReceived(evt) {
    
    var response = JSON.parse(evt.target.response);

    var select = document.getElementById(evt.target.scope);

    if( response["results"]["bindings"].length>0){
      evt.target.callback();
    }

    for (let match of response["results"]["bindings"]) {
        let element = document.createElement("option");
        element.append(match["label"]["value"]);
        element.setAttribute("value", match["subject"]["value"]);
        select.append(element);
    }
  
    select.addEventListener("change", onSelectChange);
    var uuid = uuidv4();
    select.setAttribute("selectedChild",uuid);


    
    var div = document.createElement("div");
    var label = document.createElement("label");
    div.append(label);
    

    
    label.setAttribute("for",uuid);
    label.append("subtype");
    var newSelect = document.createElement("select");
    newSelect.setAttribute("id",uuid);
    newSelect.setAttribute("database",evt.target.database);
    

    var optionAny = document.createElement("option");
    optionAny.setAttribute("value","any");
    optionAny.append("any")

    newSelect.append(optionAny);
    div.append(newSelect);
    select.insertAdjacentElement("afterend", div);
    div.style.display="none";

}



function loadSemanticData(snowmed_id,scope,database,callback = function(){}) {

    console.log(snowmed_id+";"+scope);
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
PREFIX owl: <http://www.w3.org/2002/07/owl#>\
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\
\
\
\
SELECT ?subject ?label \
WHERE {\
  ?subject rdfs:subClassOf <"+snowmed_id+">\
  \
  OPTIONAL {\
  ?subject rdfs:label ?label\
}\
\
}\
";
    var oReq = new XMLHttpRequest();
    oReq.open("POST", database+"/query");
    oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    oReq.addEventListener("load", semanticDataReceived);
    oReq.scope=scope;
    oReq.database=database;
    oReq.callback=callback;
    oReq.send("query=" + encodeURIComponent(query));
}

for( let semanticRoot of document.getElementsByTagName("semantic-selector")){
  var isSingleSemanticSelector=semanticRoot.hasAttribute("single");
  if(isSingleSemanticSelector ){
    var template="semantic-selector-single.mustache";
  
  
  fetch(template)
    .then((response) => response.text())
    .then((template) => {
      var rootName=semanticRoot.getAttribute("rootName");
      var rootURI=semanticRoot.getAttribute("rootURI");
      var database=semanticRoot.getAttribute("database");
      var rendered = Mustache.render(template, { 
                                                rootName: rootName,
                                                rootURI:rootURI,
                                                database:database
                                              });
      semanticRoot.innerHTML = rendered;    
      loadSemanticData(rootURI,rootName,database);
    });
  }
  
}



