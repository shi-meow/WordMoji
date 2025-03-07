// Define emojis array and spacing constant in global scope
const emojis = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎳', '🎱', '🎰', '🎼', '🎵', '🎸', '🌟', '✨', '💫', '🔮', '🎩', '🎬', '🎤', '🎧', '🎹', '🎻', '🎺', '🎷', '🪩', '🎪', '🎡', '🎢', '🎠', '🎪'];
const DESIRED_EMOJI_SPACING = 60; // Consistent spacing between emojis
let mouseY = window.innerHeight / 2; // Initialize mouseY in global scope

// Import cursor module and pixel dust
import { initCursor, addCursorHoverEffect } from '../utils/cursor.js';
import { createPixelDust } from '../utils/pixelDust.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize pixel dust
    createPixelDust();

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('.play-button, .emoji');
    addCursorHoverEffect(interactiveElements);

    const launchContainer = document.getElementById('launchScreen');
    const loadingScreen = document.getElementById('loadingScreen');
    const gameContainer = document.getElementById('gameContainer');
    const playButton = document.getElementById('playButton');
    const gameFrame = document.getElementById('gameFrame');
    const loadingProgress = document.getElementById('loadingProgress');

    // Add loading state management
    let isLoading = false;

    // Set z-index for emojis container to be below play button
    launchContainer.style.position = 'relative';
    playButton.style.zIndex = '2';

    // Function to update loading progress with easing
    const updateProgress = (targetPercent) => {
        const currentWidth = parseFloat(loadingProgress.style.width) || 0;
        const duration = 500; // Duration in milliseconds
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth transition
            const easeOutCubic = progress => 1 - Math.pow(1 - progress, 3);
            const easedProgress = easeOutCubic(progress);
            
            const currentPercent = currentWidth + (targetPercent - currentWidth) * easedProgress;
            loadingProgress.style.width = `${currentPercent}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    };

    playButton.addEventListener('click', () => {
        if (isLoading) return;
        
        // Start loading sequence
        isLoading = true;
        launchScreen.style.display = 'none';
        loadingScreen.style.display = 'flex';
        updateProgress(0);

        // Clean up existing cursor and reinitialize for loading screen
        const existingCursor = document.querySelector('.custom-cursor');
        if (existingCursor) {
            existingCursor.remove();
        }
        initCursor();
        addCursorHoverEffect([document.querySelector('.loading-emoji')]);
        
        // Ensure cursor position is updated
        document.addEventListener('mousemove', (e) => {
            const cursor = document.querySelector('.custom-cursor');
            if (cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });

        // Create a new iframe for the game
        const newGameFrame = document.createElement('iframe');
        newGameFrame.id = 'gameFrame';
        newGameFrame.style.width = '100%';
        newGameFrame.style.height = '100%';
        newGameFrame.style.border = 'none';
        
        // Replace existing game frame
        gameContainer.innerHTML = '';
        gameContainer.appendChild(newGameFrame);

        // Simulate loading progress with smoother updates
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 8 + 2; // More consistent increments
                updateProgress(Math.min(90, progress));
            }
        }, 300); // Slightly faster updates

        // Set the iframe src after a short delay to show initial loading progress
        setTimeout(() => {
            newGameFrame.src = 'game.html';
        }, 1000);

        // Monitor game frame loading
        newGameFrame.onload = () => {
            // Initialize the game
            newGameFrame.contentWindow.initGame();

            // Listen for game initialization completion
            window.addEventListener('message', function gameInitHandler(event) {
                if (event.data === 'gameInitialized') {
                    // Remove the event listener
                    window.removeEventListener('message', gameInitHandler);
                    
                    // Update progress to 100% and transition to game
                    clearInterval(progressInterval);
                    updateProgress(100);
                    
                    // Short delay for smooth transition
                    setTimeout(() => {
                        isLoading = false;
                        loadingScreen.style.opacity = '0';
                        loadingScreen.style.transition = 'opacity 0.5s ease-out';
                        
                        // Wait for loading screen to fade out before showing game
                        setTimeout(() => {
                            loadingScreen.style.display = 'none';
                            gameContainer.style.display = 'block';
                            gameContainer.style.opacity = '0';
                            gameContainer.style.transition = 'opacity 0.8s ease-in';
                            
                            // Trigger fade in
                            setTimeout(() => {
                                gameContainer.style.opacity = '1';
                            }, 50);
                            
                            // Clean up cursor when transitioning to game
                            const cursor = document.querySelector('.custom-cursor');
                            if (cursor) {
                                cursor.remove();
                            }
                        }, 500);
                    }, 500);
                }
            });
        };

        // Error handling
        newGameFrame.onerror = () => {
            clearInterval(progressInterval);
            isLoading = false;
            loadingScreen.style.display = 'none';
            launchScreen.style.display = 'flex';
            alert('Failed to load the game. Please try again.');
        };

        // Add timeout for loading
        setTimeout(() => {
            if (isLoading) {
                clearInterval(progressInterval);
                isLoading = false;
                loadingScreen.style.display = 'none';
                launchScreen.style.display = 'flex';
                alert('Loading took too long. Please try again.');
            }
        }, 15000); // 15 second timeout
    });
});

// Move emoji initialization to window.onload
window.addEventListener('load', () => {
    // Initialize custom cursor after DOM is fully loaded
    initCursor();
    createEmojiRing();
    
    window.addEventListener('mousemove', (e) => {
        mouseY = e.clientY;
        updateEmojiPositions();
    });
    
    window.addEventListener('resize', updateEmojiPositions);
});

function createEmojiRing() {
    const container = document.querySelector('.launch-container');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    
    // Calculate number of emojis based on circumference and desired spacing
    const circumference = 2 * Math.PI * baseRadius;
    const maxEmojis = Math.floor(circumference / DESIRED_EMOJI_SPACING);
    
    // Use only as many emojis as can fit with proper spacing
    const activeEmojis = emojis.slice(0, Math.min(maxEmojis, emojis.length));
    
    // Clear existing emojis first
    const existingEmojis = container.querySelectorAll('.emoji');
    existingEmojis.forEach(emoji => emoji.remove());
    
    activeEmojis.forEach((emoji, index) => {
        const angle = (index / activeEmojis.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * baseRadius;
        const y = centerY + Math.sin(angle) * baseRadius;
    
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji';
        emojiElement.textContent = emoji;
        emojiElement.style.opacity = '0';
        emojiElement.style.left = `${x}px`;
        emojiElement.style.top = `${y}px`;
        emojiElement.style.transform = 'translate(-50%, -50%) scale(0.5)';
        emojiElement.style.transition = 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out';
        container.appendChild(emojiElement);
    
        // Add a longer initial delay for more noticeable sequential appearance
        setTimeout(() => {
            emojiElement.style.opacity = '0.8';
            emojiElement.style.transform = 'translate(-50%, -50%) scale(1)';
            // Add pulsing animation after the initial reveal
            setTimeout(() => {
                emojiElement.style.animation = 'pulse 2s infinite';
            }, 800);
        }, index * 300); // Increased delay between each emoji
    });
}

function updateEmojiPositions() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const minRadius = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.6;
    
    const mouseRatio = mouseY / window.innerHeight;
    const baseRadius = minRadius + (maxRadius - minRadius) * mouseRatio;
    
    // Calculate number of emojis based on circumference and desired spacing
    const circumference = 2 * Math.PI * baseRadius;
    const maxEmojis = Math.floor(circumference / DESIRED_EMOJI_SPACING);
    
    // Use only as many emojis as can fit with proper spacing
    const targetEmojiCount = Math.min(maxEmojis, emojis.length)
    
    const container = document.querySelector('.launch-container');
    const existingEmojis = container.querySelectorAll('.emoji');
    
    existingEmojis.forEach((emoji, index) => {
        if (index >= emojis.length) {
            emoji.remove();
        }
    });
    
    emojis.forEach((emoji, index) => {
        const angle = (index / emojis.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * baseRadius;
        const y = centerY + Math.sin(angle) * baseRadius;
        
        let emojiElement = existingEmojis[index];
        if (!emojiElement) {
            emojiElement = document.createElement('div');
            emojiElement.className = 'emoji';
            emojiElement.style.opacity = '0';
            container.appendChild(emojiElement);
            
            // Add fade-in animation for new emojis
            setTimeout(() => {
                emojiElement.style.opacity = '0.8';
            }, 50);
        }
        
        emojiElement.textContent = emoji;
        emojiElement.style.left = `${x}px`;
        emojiElement.style.top = `${y}px`;
    });
}