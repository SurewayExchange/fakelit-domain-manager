// Debug script to test button functionality
console.log('Debug script loaded');

// Test if functions are available
console.log('openChatModal function:', typeof openChatModal);
console.log('startChat function:', typeof startChat);

// Add click event listeners to all buttons with onclick attributes
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Find all buttons with onclick attributes
    const buttons = document.querySelectorAll('button[onclick]');
    console.log('Found buttons with onclick:', buttons.length);
    
    buttons.forEach((button, index) => {
        console.log(`Button ${index}:`, button.textContent.trim(), 'onclick:', button.getAttribute('onclick'));
        
        // Add additional click listener for debugging
        button.addEventListener('click', function(e) {
            console.log('Button clicked:', button.textContent.trim());
            console.log('Original onclick:', button.getAttribute('onclick'));
        });
    });
    
    // Check if chat modal exists
    const chatModal = document.getElementById('chatModal');
    console.log('Chat modal found:', !!chatModal);
    
    // Check if required scripts are loaded
    console.log('main.js loaded:', typeof setupNavigation !== 'undefined');
    console.log('chat.js loaded:', typeof CareConnectChat !== 'undefined');
});

// Override console.error to catch any errors
const originalError = console.error;
console.error = function(...args) {
    console.log('ERROR CAUGHT:', ...args);
    originalError.apply(console, args);
}; 