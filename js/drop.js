const redisBackend="https://datastore.nextnet.top/GET/";



const input = document.getElementById('dataset-file');


const upload = (file) => {
  var uuid=uuidv4();
  fetch('https://datastore.nextnet.top/SET/'+uuid, { 
    method: 'PUT',
    body: file 
  }
  ).then(
      
    success => { 
        
    console.log(success+" time to put "+uuid+" in fuseki");



    fetch("sparql-label-dataset.mustache")
    .then((response) => response.text())
    .then((template) => {
      
      var datasetId=uuid;
      var datasetURI=redisBackend+uuid;
      var rendered = Mustache.render(template, { 
        datasetId: datasetId,
        datasetURI:datasetURI,
        subclasses:Object.values(loadSemanticClassification())
                                              });

      console.log("sending");
      console.log(rendered);
      fetch(sparqlBackend+"/update",{
          method: "POST",
          headers: {
            
             'Content-Type': 'application/x-www-form-urlencoded',
          },
          
          body : "update="+encodeURIComponent(rendered)

      }).then( success => { 
          console.log(success); 

          alert('Your dataset has been submitted to the data store and its metadata to the semantic database');
          window.location.href='index.html';
        })
      .catch(
        error => console.log(error) 
      );

    }

  ).catch(
    error => console.log(error) 
  );
  })};


const onSelectFile = () => upload(input.files[0]);


input.addEventListener('change', onSelectFile, false);


