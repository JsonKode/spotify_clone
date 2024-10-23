const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const tracksList = document.getElementById('tracksList');
const audioPlayer = document.getElementById('audioPlayer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const toggleTracksButton = document.getElementById('toggleTracksButton');

let accessToken = '';
let trackURIs = []; // Array to hold track URIs
let currentTrackIndex = 0; // Index for current track

// Replace with your Spotify API Client ID and Client Secret
const clientId = '93d1d06c3792453b8e8c16470f64ebbf';
const clientSecret = 'ad6b01c055d8422185c8709ae3fb3a60';
const tokenUrl = 'https://accounts.spotify.com/api/token';

async function getAccessToken() {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    accessToken = data.access_token;
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    if (query) {
        if (!accessToken) {
            getAccessToken().then(() => searchMusic(query));
        } else {
            searchMusic(query);
        }
    }
});

function searchMusic(query) {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`;

    fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayResults(data.tracks.items))
    .catch(error => console.error('Error:', error));
}

function displayResults(tracks) {
    tracksList.innerHTML = ''; // Clear previous results
    trackURIs = []; // Reset the track URIs array

    tracks.forEach(track => {
        trackURIs.push(track.preview_url); // Store track preview URL
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${track.name}</strong> by ${track.artists.map(artist => artist.name).join(', ')}
            <button onclick="playTrack(${trackURIs.length - 1})">Play</button>
        `;
        tracksList.appendChild(li);
    });
}

// Function to play a track
function playTrack(index) {
    if (trackURIs[index]) {
        audioPlayer.src = trackURIs[index];
        audioPlayer.play();
        currentTrackIndex = index; // Update current track index
    }
}

// Play next track when the current one ends
audioPlayer.addEventListener('ended', () => {
    nextTrack();
});

// Next button functionality
nextButton.addEventListener('click', () => {
    nextTrack();
});

// Previous button functionality
prevButton.addEventListener('click', () => {
    prevTrack();
});

// Function to play the next track
function nextTrack() {
    currentTrackIndex++;
    if (currentTrackIndex >= trackURIs.length) {
        currentTrackIndex = 0; // Loop back to the first track
    }
    playTrack(currentTrackIndex);
}

// Function to play the previous track
function prevTrack() {
    currentTrackIndex--;
    if (currentTrackIndex < 0) {
        currentTrackIndex = trackURIs.length - 1; // Loop to the last track
    }
    playTrack(currentTrackIndex);
}

// Toggle track list visibility
toggleTracksButton.addEventListener('click', () => {
    tracksList.classList.toggle('show'); // Toggle the display class
    toggleTracksButton.textContent = tracksList.classList.contains('show') ? 'Hide Tracks' : 'Show Tracks';
});
