// Test function
function testFunction() {
    alert('JavaScript is working! 🎉');
    console.log('Test button clicked');
}

// Add event listener for test button
document.addEventListener('DOMContentLoaded', function() {
    // Test button functionality
    document.getElementById('testButton').addEventListener('click', function() {
        alert('JavaScript is working! 🎉');
        console.log('Test button clicked');
    });
    
    // Load time
    document.getElementById('loadTime').textContent = new Date().toLocaleTimeString();
    
    // Chrome APIs check
    const chromeApis = typeof chrome !== 'undefined' && chrome.runtime ? '✅ Available' : '❌ Not available';
    document.getElementById('chromeApis').textContent = chromeApis;
    
    // Storage access test
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['test'], function(result) {
            document.getElementById('storageAccess').textContent = '✅ Working';
        });
    } else {
        document.getElementById('storageAccess').textContent = '❌ Not available';
    }
    
    // Background script test
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({action: 'ping'}, function(response) {
            if (chrome.runtime.lastError) {
                document.getElementById('backgroundStatus').textContent = '❌ Error: ' + chrome.runtime.lastError.message;
            } else {
                document.getElementById('backgroundStatus').textContent = '✅ Connected';
            }
        });
    } else {
        document.getElementById('backgroundStatus').textContent = '❌ Not available';
    }
    
    console.log('PromptStruct test popup loaded successfully');
});
