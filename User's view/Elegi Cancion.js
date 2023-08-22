
<script src="https://kit.fontawesome.com/a0dea97709.js" crossorigin="anonymous"></script>
// ... (El resto del código se mantiene igual hasta la función displayResults)

// Función para mostrar los resultados de la búsqueda en el DOM
function displayResults(tracks) {
    resultsDiv.innerHTML = '';

    tracks.forEach((track) => {
        const image = track.album.images[0].url;
        const title = track.name;
        const artist = track.artists[0].name;
        const trackId = track.id;

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        const imageElement = document.createElement('img');
        imageElement.src = image;
        imageElement.alt = title;

        const titleElement = document.createElement('p');
        titleElement.textContent = title;

        const artistElement = document.createElement('p');
        artistElement.textContent = artist;

        const trackIdElement = document.createElement('p');
        trackIdElement.textContent = "ID: " + trackId;
        trackIdElement.classList.add('track-id');

        resultDiv.appendChild(imageElement);
        resultDiv.appendChild(titleElement);
        resultDiv.appendChild(artistElement);
        resultDiv.appendChild(trackIdElement); // No olvides agregar el ID al div de resultado

        resultsDiv.appendChild(resultDiv);
    });

    // Mostrar el menú desplegable con los resultados
    document.getElementById('resultsDropdown').style.display = 'block';
}

