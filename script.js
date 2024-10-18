const musicUpload = document.getElementById('musicUpload');
const musicPlayer = document.getElementById('musicPlayer');
const downloadButton = document.getElementById('downloadMusic');

let audioContext, audioSource, gainNode, pannerNode, bassFilter, mediaRecorder, audioChunks;

// Load music when user uploads a file
musicUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        musicPlayer.src = fileURL;
        setupAudioContext();
    }
});

// Set up the Audio Context for effects
function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioSource = audioContext.createMediaElementSource(musicPlayer);

    // Create Gain Node for volume control
    gainNode = audioContext.createGain();

    // Create Panner Node for spatial sound effects
    pannerNode = audioContext.createPanner();
    pannerNode.panningModel = 'HRTF';  // Head-related transfer function for realistic spatial effects

    // Create Bass Filter (Low-pass filter for bass boost)
    bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.setValueAtTime(200, audioContext.currentTime);
    bassFilter.gain.setValueAtTime(0, audioContext.currentTime); // Start with neutral bass

    // Connect the nodes
    audioSource
        .connect(gainNode)
        .connect(pannerNode)
        .connect(bassFilter)
        .connect(audioContext.destination);

    // Setup MediaRecorder for download
    setupMediaRecorder();
}

// Apply 4D sound effect
document.getElementById('4dSound').addEventListener('click', function() {
    applySpatialEffect(4);
});

// Apply 6D sound effect
document.getElementById('6dSound').addEventListener('click', function() {
    applySpatialEffect(6);
});

// Apply 8D sound effect
document.getElementById('8dSound').addEventListener('click', function() {
    applySpatialEffect(8);
});

// Apply surround sound (Movable sound)
document.getElementById('surroundSound').addEventListener('click', function() {
    surroundSoundEffect();
});

// Toggle high bass effect
document.getElementById('highBass').addEventListener('click', function() {
    toggleBassBoost();
});

// Reset all effects
document.getElementById('resetAll').addEventListener('click', function() {
    resetEffects();
});

// Function to apply spatial sound effects based on type
function applySpatialEffect(type) {
    if (!audioContext) return;
    
    // Reset the panner node before applying new effect
    pannerNode.setPosition(0, 0, 0);

    switch (type) {
        case 4:
            pannerNode.setPosition(0, 0, 1); // 4D positioning
            break;
        case 6:
            pannerNode.setPosition(1, 0, 0); // 6D positioning
            break;
        case 8:
            pannerNode.setPosition(1, 1, 1); // 8D positioning
            break;
    }
}

// Function to create a surround sound effect (Movable sound)
function surroundSoundEffect() {
    if (!audioContext) return;

    let angle = 0;
    const radius = 3;  // Distance from listener

    const moveSound = () => {
        angle += 0.02; // Adjust speed
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        pannerNode.setPosition(x, 0, z);

        if (musicPlayer.paused) return; // Stop moving if music is paused
        requestAnimationFrame(moveSound);
    };
    moveSound();
}

// Function to toggle high bass (bass boost effect)
function toggleBassBoost() {
    const currentGain = bassFilter.gain.value;

    if (currentGain === 0) {
        bassFilter.gain.setValueAtTime(15, audioContext.currentTime);  // Boost bass
        console.log('Bass Boosted');
    } else {
        bassFilter.gain.setValueAtTime(0, audioContext.currentTime);  // Reset bass
        console.log('Bass Reset');
    }
}

// Function to reset all effects
function resetEffects() {
    pannerNode.setPosition(0, 0, 0);
    bassFilter.gain.setValueAtTime(0, audioContext.currentTime); // Reset bass
    console.log('Effects reset');
}

// MediaRecorder setup for downloading audio with effects
function setupMediaRecorder() {
    audioChunks = [];
    mediaRecorder = new MediaRecorder(audioContext.createMediaStreamDestination().stream);

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
        const audioURL = URL.createObjectURL(audioBlob);
        downloadButton.href = audioURL;
        downloadButton.download = 'enhanced_music.mp3';
    };
}

// Start recording when music starts playing
musicPlayer.addEventListener('play', () => {
    mediaRecorder.start();
});

// Stop recording when music ends
musicPlayer.addEventListener('pause', () => {
    mediaRecorder.stop();
});
