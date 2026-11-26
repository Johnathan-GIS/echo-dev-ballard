// call this from index.html

// fetch that data.json

function getData() {
  fetch('data/data.json')
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      displayData(data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
}

getData(); 

function displayData(data) {
  const dataContainer = document.getElementById('dataContainer');
  dataContainer.innerHTML = ''; // Clear previous content 
  // loop through the data and create HTML elements for each item
  data.forEach((item) => {
    
  dataContainer.innerHTML += `
     <!-- Card 4: Southeast -->
          <div class="col-md-6 col-lg-3 southeast">
            <div class="p-3 border bg-white rounded h-100 shadow-sm d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-primary"> ${item.location} </span>
                <span class="badge bg-success">Published</span>
              </div>
              <img src="images/outer-banks-image.jpg" class="card-img-top rounded mb-3" alt="Outer Banks" style="height: 160px; object-fit: cover;">
              <h4 class="h6 fw-bold mb-1">Outer Banks</h4>
              <p class="small text-muted mb-2">Islands of adventure</p>
              <p class="small text-secondary flex-grow-1">Explore Atlanta, Nashville, Miami, and Charleston.</p>
              
              <div class="mb-2">
                <span class="badge bg-light text-dark border">#Beach</span>
                <span class="badge bg-light text-dark border">#Adventure</span>
              </div>

              <div class="small text-muted mb-3 border-top pt-2">
                <div><i class="bi bi-person"></i> Johnathan Ballard</div>
                <div><i class="bi bi-calendar"></i> Jul 04, 2026</div>
              </div>

              <a href="https://www.outerbanks.org/" class="btn btn-dark btn-sm w-100 mb-3" target="_blank" rel="noopener noreferrer">Visit Outer Banks</a>

              <div class="bg-light p-2 rounded small text-muted">
                <strong>Comments (1):</strong>
                <p class="mb-0 mt-1"><em>OceanFan:</em> Beautiful beaches!</p>
              </div>
            </div>
          </div>

`;
}); 
}

// display that data json in the dom 