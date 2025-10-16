// script.js

let fileToUpload = null;
let currentlyDisplayedReviewId = null;

function handleFile(file) {
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Error: File is larger than 5MB.');
            return;
        }
        fileToUpload = file;
        const dropzoneText = document.getElementById('dropzone-text');
        dropzoneText.textContent = file.name;
        document.getElementById('submit-button').disabled = false;
    }
}

async function deleteHistoryItem(itemId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }
    try {
        const response = await fetch(`http://127.0.0.1:5000/history/${itemId}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
            // Check if the deleted item is the one being viewed.
            // parseInt() ensures we are comparing numbers, not a number and a string.
            if (currentlyDisplayedReviewId === parseInt(itemId)) {
                document.getElementById('review-output').innerHTML = '<p>Your report will appear here...</p>';
                currentlyDisplayedReviewId = null; // Clear the tracker
            }
            loadHistory(); // Refresh the history list
        } else {
            alert('Error: Could not delete item.');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error: Could not delete item.');
    }
}

async function loadHistory() {
    const historyList = document.getElementById('history-list');
    try {
        const response = await fetch('http://127.0.0.1:5000/history');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const historyData = await response.json();
        historyList.innerHTML = ''; 

        if (historyData.length === 0) {
            historyList.innerHTML = '<li class="text-gray-500">No history found.</li>';
            return;
        }

        historyData.forEach(item => {
            const li = document.createElement('li');
            const reviewDate = new Date(item.timestamp).toLocaleString();
            
            li.className = 'bg-black/20 p-4 rounded-lg hover:bg-gray-800/50 border border-transparent hover:border-cyan-500/50 transition-all';
            li.innerHTML = `
                <span class="delete-btn" data-id="${item.id}" title="Delete review">&times;</span>
                <strong class="text-cyan-400 block cursor-pointer">${item.filename}</strong>
                <span class="text-sm text-gray-400">${reviewDate}</span>`;
            
            li.querySelector('strong').addEventListener('click', () => {
                const reviewOutput = document.getElementById('review-output');
                reviewOutput.innerHTML = `<div class="prose prose-invert max-w-none">${marked.parse(item.review_content)}</div>`;
                currentlyDisplayedReviewId = item.id; // Track which review is open
                document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });
            });

            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation(); 
                const id = e.target.getAttribute('data-id');
                deleteHistoryItem(id);
            });
            historyList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading history:', error);
        historyList.innerHTML = '<li class="text-red-400">Error loading history.</li>';
    }
}

document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault(); 
    if (!fileToUpload) {
        alert('Please select a file to review.');
        return;
    }
    const submitButton = document.getElementById('submit-button');
    const loader = document.getElementById('loader-container'); 
    const reviewOutput = document.getElementById('review-output');

    reviewOutput.innerHTML = ''; 
    loader.classList.remove('hidden');
    submitButton.disabled = true;
    submitButton.textContent = 'Analyzing...';
    currentlyDisplayedReviewId = null; 

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
        const response = await fetch('http://127.0.0.1:5000/review', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        
        // **THIS IS THE KEY FIX**: Display the review and immediately
        // capture its ID from the server's response.
        reviewOutput.innerHTML = `<div class="prose prose-invert max-w-none">${marked.parse(result.review)}</div>`;
        currentlyDisplayedReviewId = result.id; 

        loadHistory(); 
    } catch (error) {
        console.error('Error:', error);
        reviewOutput.innerHTML = `<p class="text-red-400">An error occurred while getting the review. Check the console for details.</p>`;
    } finally {
        loader.classList.add('hidden');
        submitButton.disabled = false;
        submitButton.textContent = 'Review Code';
        fileToUpload = null;
        document.getElementById('dropzone-text').textContent = 'Drag & drop your file here, or click to select a file';
        document.getElementById('upload-form').reset();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-cyan-400', 'bg-gray-800/50');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-cyan-400', 'bg-gray-800/50');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-cyan-400', 'bg-gray-800/50');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
});