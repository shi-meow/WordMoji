export class WordGame {
    constructor() {
        // Initialize game when explicitly called
        this.isInitialized = false;
    }

    initializeGameComponents() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        // Initialize cursor module
        import('../utils/cursor.js').then(({ initCursor, addCursorHoverEffect }) => {
            initCursor();
            // Add hover effect to interactive elements
            const interactiveElements = document.querySelectorAll('.tile');
            addCursorHoverEffect(interactiveElements);
        });

        // Game constants
        this.GRID_SIZE = { x: 5, y: 5 };
        this.LETTER_DISTRIBUTION = {
            'A': 12, 'B': 3, 'C': 3, 'D': 4, 'E': 15, 'F': 2, 'G': 3, 'H': 3, 'I': 10,
            'J': 1, 'K': 1, 'L': 6, 'M': 3, 'N': 8, 'O': 10, 'P': 3, 'Q': 1, 'R': 8,
            'S': 8, 'T': 8, 'U': 5, 'V': 2, 'W': 2, 'X': 1, 'Y': 3, 'Z': 1
        };
        this.DIRECTIONS = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [1, -1],  // diagonal down-left
            [-1, 1],  // diagonal up-right
            [-1, -1], // diagonal up-left
            [-1, 0],  // up
            [0, -1]   // left
        ];
        this.wordList = [];

        // Game state
        this.score = 0;
        this.wordsFound = 0;
        this.currentWord = '';
        this.selectedTiles = [];
        this.usedWords = new Set();
        this.wordCache = new Map();
        this.grid = [];
        this.isDragging = false;
        this.connectionLines = [];

        // DOM elements
        this.gridElement = document.getElementById('grid');
        this.currentWordElement = document.getElementById('currentWord');
        this.messageElement = document.getElementById('message');
        this.scoreElement = document.getElementById('score');
        this.wordsFoundElement = document.getElementById('wordsFound');
        this.totalWordsElement = document.getElementById('totalWords');
        this.wordInfoContent = document.getElementById('wordInfoContent');
        this.wordInfoTitle = document.getElementById('wordInfoTitle');

        // Add visualization state
        this.currentSketch = null;
        this.visualizationContainer = document.getElementById('visualization-container');
        this.GEMINI_API_KEY = 'AIzaSyBlR1nRDfg0GvfuxKs8suaAOxRVdIfHKwU';
        this.GEMINI_MODEL = 'models/gemini-2.0-flash';

        // Style the visualization container
        this.visualizationContainer.style.width = '100%';
        this.visualizationContainer.style.minHeight = '200px';
        this.visualizationContainer.style.height = 'auto';
        this.visualizationContainer.style.marginTop = '20px';
        this.visualizationContainer.style.display = 'none'; // Hide by default
        this.visualizationContainer.style.justifyContent = 'center';
        this.visualizationContainer.style.alignItems = 'center';

        // Initialize pixel dust
        this.createPixelDust();

        // Initialize the game
        this.initializeGame();

        // Initialize Word Info panel with empty state
        this.initializeWordInfoPanel();
    }

    initializeWordInfoPanel() {
        const wordInfoPanel = document.getElementById('wordInfoPanel');
        wordInfoPanel.classList.remove('hidden');
        this.wordInfoTitle.textContent = 'How to Play';
        this.wordInfoContent.innerHTML = `
            <div class="game-instructions">
                <p>🎯 Find words by connecting adjacent letters in any direction.</p>
                <p>📝 Words must be 3-5 letters long.</p>
                <p>🌟 Each letter can be used only once per word.</p>
                <p>✨ Score points based on word length!</p>
                <p>🎮 Click and drag to select letters.</p>
                <p>🎨 Get a unique emoji art for each word you find!</p>
            </div>
        `;
    }

    async initializeGame() {
        let validWordsCount = 0;
        do {
            // Load word list from file
            await this.loadWordList();
            
            // Initialize empty grid
            this.initializeEmptyGrid();
            
            // Place words in the grid
            this.placeWordsInGrid();
            
            // Fill remaining spaces with random letters
            this.fillEmptySpaces();
    
            // Find all possible words in the grid before creating tiles
            const validWords = await this.findAllPossibleWords();
            validWordsCount = validWords.length;
    
            if (validWordsCount < 50) {
                console.log('Not enough possible words found, regenerating grid...');
            }
        } while (validWordsCount < 50);
        
        // Create tiles for the grid
        for (let y = 0; y < this.GRID_SIZE.y; y++) {
            for (let x = 0; x < this.GRID_SIZE.x; x++) {
                this.createTile(x, y, this.grid[y][x]);
            }
        }

        // Show grid after it's fully initialized
        this.gridElement.style.display = 'grid';

        // Initialize word counter
        this.wordsFound = 0;
        this.wordsFoundElement.textContent = '0';

        // Add event listeners
        this.setupEventListeners();

        // Signal that initialization is complete
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage('gameInitialized', '*');
        }
    }

    // Add this new method
    async findAllPossibleWords() {
        // Wait for wordList to be loaded if it hasn't been
        if (!this.wordList || this.wordList.length === 0) {
            await this.loadWordList();
        }

        console.log('Word list loaded, length:', this.wordList.length);
        console.log('Current grid state:', this.grid);

        const visited = Array(this.GRID_SIZE.y).fill().map(() => Array(this.GRID_SIZE.x).fill(false));
        const possibleWords = new Set();

        // Try starting from each position in the grid
        for (let y = 0; y < this.GRID_SIZE.y; y++) {
            for (let x = 0; x < this.GRID_SIZE.x; x++) {
                this.searchWords(x, y, '', visited, possibleWords);
            }
        }

        const validWords = [...possibleWords].filter(word => this.wordList.includes(word));
        console.log('All possible words in this grid:', validWords);
        
        // Only update totalWordsElement if it exists
        if (this.totalWordsElement) {
            this.totalWordsElement.textContent = validWords.length;
        }

        return validWords;
    }

    searchWords(x, y, currentWord, visited, possibleWords) {
        // Check boundaries and visited status
        if (x < 0 || x >= this.GRID_SIZE.x || y < 0 || y >= this.GRID_SIZE.y || visited[y][x]) {
            return;
        }

        // Add current letter to word
        const newWord = currentWord + this.grid[y][x];

        // Add word if it's valid length and in the word list
        if (newWord.length >= 3 && newWord.length <= 5 && this.wordList.includes(newWord)) {
            possibleWords.add(newWord);
        }

        // Stop if word is too long
        if (newWord.length >= 5) {
            return;
        }

        // Mark current position as visited
        visited[y][x] = true;

        // Search in all 8 directions
        const directions = [
            [-1,-1], [-1,0], [-1,1],
            [0,-1],          [0,1],
            [1,-1],  [1,0],  [1,1]
        ];

        for (const [dx, dy] of directions) {
            this.searchWords(x + dx, y + dy, newWord, visited, possibleWords);
        }

        // Unmark current position (backtrack)
        visited[y][x] = false;
    }

    async loadWordList() {
        try {
            console.log('Starting to load word list...');
            const response = await fetch('words_alpha.txt');
            const text = await response.text();
            console.log('Word list file loaded, processing...');
            
            // Filter and process the word list
            this.wordList = text.split('\n')
                .map(word => word.trim())
                .filter(word => word.length >= 3 && word.length <= 5)
                .map(word => word.toUpperCase());
            
            console.log(`Word list processed. Total valid words: ${this.wordList.length}`);
            console.log('Sample of words:', this.wordList.slice(0, 5));
        } catch (error) {
            console.error('Error loading word list:', error);
            this.wordList = [];
        }
    }

    initializeEmptyGrid() {
        this.grid = Array(this.GRID_SIZE.y)
            .fill()
            .map(() => Array(this.GRID_SIZE.x).fill(' '));
        console.log('Initial empty grid:', this.grid);
    }

    placeWordsInGrid() {
        const shuffledWords = [...this.wordList].sort(() => Math.random() - 0.5);
        const placedWords = new Set();

        for (const word of shuffledWords) {
            if (placedWords.size >= 5) break; // Limit to 5 words for better gameplay

            for (const [dx, dy] of this.DIRECTIONS) {
                if (this.tryPlaceWord(word, dx, dy)) {
                    placedWords.add(word);
                    break;
                }
            }
        }

        console.log('Grid after placing words:', this.grid);
        console.log('Placed words:', [...placedWords]);
    }

    tryPlaceWord(word, dx, dy) {
        const wordLength = word.length;

        for (let y = 0; y < this.GRID_SIZE.y; y++) {
            for (let x = 0; x < this.GRID_SIZE.x; x++) {
                if (this.canPlaceWord(word, x, y, dx, dy)) {
                    this.placeWord(word, x, y, dx, dy);
                    return true;
                }
            }
        }
        return false;
    }

    canPlaceWord(word, startX, startY, dx, dy) {
        const wordLength = word.length;

        // Check if word fits within grid bounds
        const endX = startX + (wordLength - 1) * dx;
        const endY = startY + (wordLength - 1) * dy;
        if (endX < 0 || endX >= this.GRID_SIZE.x || endY < 0 || endY >= this.GRID_SIZE.y) {
            return false;
        }

        // Check if word can be placed (empty spaces or matching letters)
        for (let i = 0; i < wordLength; i++) {
            const x = startX + i * dx;
            const y = startY + i * dy;
            const currentCell = this.grid[y][x];
            if (currentCell !== ' ' && currentCell !== word[i]) {
                return false;
            }
        }

        return true;
    }

    placeWord(word, startX, startY, dx, dy) {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * dx;
            const y = startY + i * dy;
            this.grid[y][x] = word[i];
        }
    }

    fillEmptySpaces() {
        const letterPool = this.createLetterPool();
        
        for (let y = 0; y < this.GRID_SIZE.y; y++) {
            for (let x = 0; x < this.GRID_SIZE.x; x++) {
                if (this.grid[y][x] === ' ' || this.grid[y][x] === '\r') {
                    const randomIndex = Math.floor(Math.random() * letterPool.length);
                    this.grid[y][x] = letterPool.splice(randomIndex, 1)[0];
                }
            }
        }
        console.log('Final grid after filling empty spaces:', this.grid);
    }

    createLetterPool() {
        const pool = [];
        for (const [letter, count] of Object.entries(this.LETTER_DISTRIBUTION)) {
            for (let i = 0; i < count; i++) {
                pool.push(letter);
            }
        }
        return pool;
    }

    createTile(x, y, letter) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.textContent = this.grid[y][x];
        tile.letter = this.grid[y][x];
        this.gridElement.appendChild(tile);

        // Add touch events for mobile
        tile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTileSelection(tile);
        });

        tile.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('tile')) {
                this.handleTileSelection(element);
            }
        });
    }



    searchWords(x, y, currentWord, visited, possibleWords) {
        // Check boundaries and visited status
        if (x < 0 || x >= this.GRID_SIZE.x || y < 0 || y >= this.GRID_SIZE.y || visited[y][x]) {
            return;
        }

        // Add current letter to word
        const newWord = currentWord + this.grid[y][x];

        // Add word if it's valid length and in the word list
        if (newWord.length >= 3 && newWord.length <= 5 && this.wordList.includes(newWord)) {
            possibleWords.add(newWord);
        }

        // Stop if word is too long
        if (newWord.length >= 5) {
            return;
        }

        // Mark current position as visited
        visited[y][x] = true;

        // Search in all 8 directions
        const directions = [
            [-1,-1], [-1,0], [-1,1],
            [0,-1],          [0,1],
            [1,-1],  [1,0],  [1,1]
        ];

        for (const [dx, dy] of directions) {
            this.searchWords(x + dx, y + dy, newWord, visited, possibleWords);
        }

        // Unmark current position (backtrack)
        visited[y][x] = false;
    }

    setupEventListeners() {
        // Mouse events for tile selection
        this.gridElement.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('tile')) {
                this.isDragging = true;
                this.handleTileSelection(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.currentWord.length >= 3) {
                    this.submitWord();
                } else {
                    this.clearSelection();
                }
            }
        });

        // Tile hover for drag selection
        this.gridElement.addEventListener('mouseover', (e) => {
            if (this.isDragging && e.target.classList.contains('tile')) {
                this.handleTileSelection(e.target);
            }
        });
    }

    handleTileSelection(tile) {
        // If moving back to the second-to-last selected tile, deselect the last tile
        if (this.selectedTiles.length > 1 && 
            tile === this.selectedTiles[this.selectedTiles.length - 2]) {
            const lastTile = this.selectedTiles.pop();
            lastTile.classList.remove('selected');
            this.currentWord = this.currentWord.slice(0, -1);
            this.currentWordElement.textContent = this.currentWord;
            return;
        }

        // If clicking the last selected tile, deselect it
        if (this.selectedTiles.length > 0 && 
            tile === this.selectedTiles[this.selectedTiles.length - 1]) {
            this.selectedTiles.pop();
            tile.classList.remove('selected');
            this.currentWord = this.currentWord.slice(0, -1);
            this.currentWordElement.textContent = this.currentWord;
            return;
        }

        // Don't allow selecting a tile that's already selected (except for deselection cases above)
        if (this.selectedTiles.includes(tile)) {
            return;
        }

        // Check if the new tile is adjacent to the last selected tile
        if (this.selectedTiles.length > 0) {
            const lastTile = this.selectedTiles[this.selectedTiles.length - 1];
            if (!this.isAdjacent(lastTile, tile)) {
                return;
            }
        }

        // Add the tile to selection
        tile.classList.add('selected');
        this.selectedTiles.push(tile);
        this.currentWord += tile.textContent;
        this.currentWordElement.textContent = this.currentWord;

        // Draw connection line if there are at least 2 tiles
        if (this.selectedTiles.length >= 2) {
            const lastTile = this.selectedTiles[this.selectedTiles.length - 2];
            this.drawConnectionLine(lastTile, tile);
        }
    }

    isAdjacent(tile1, tile2) {
        const x1 = parseInt(tile1.dataset.x);
        const y1 = parseInt(tile1.dataset.y);
        const x2 = parseInt(tile2.dataset.x);
        const y2 = parseInt(tile2.dataset.y);

        return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
    }

    drawConnectionLine(fromTile, toTile) {
        // Get tile positions
        const fromRect = fromTile.getBoundingClientRect();
        const toRect = toTile.getBoundingClientRect();
        const gridRect = this.gridElement.getBoundingClientRect();

        // Calculate center points relative to the grid
        const fromX = (fromRect.left + fromRect.right) / 2 - gridRect.left;
        const fromY = (fromRect.top + fromRect.bottom) / 2 - gridRect.top;
        const toX = (toRect.left + toRect.right) / 2 - gridRect.left;
        const toY = (toRect.top + toRect.bottom) / 2 - gridRect.top;

        // Create line element
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        // Calculate line length and angle
        const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Style the line
        line.style.width = `${length}px`;
        line.style.left = `${fromX}px`;
        line.style.top = `${fromY}px`;
        line.style.transform = `rotate(${angle}rad)`;
        line.style.transformOrigin = '0 0';

        // Add line to grid and store reference
        this.gridElement.appendChild(line);
        this.connectionLines.push(line);

        // Create particles along the line
        this.createParticles(fromX, fromY, toX, toY);
    }

    createParticles(fromX, fromY, toX, toY) {
        const numParticles = 24; // Increased number of particles
        const baseOffset = 15; // Increased offset for more spread
        
        for (let i = 0; i < numParticles; i++) {
            // Calculate position along the line with some randomization
            const progress = (i / (numParticles - 1)) + (Math.random() * 0.1 - 0.05);
            const x = fromX + (toX - fromX) * progress;
            const y = fromY + (toY - fromY) * progress;

            // Create particle
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Add random initial position offset
            const initialOffset = baseOffset * Math.random();
            const angle = Math.random() * Math.PI * 2;
            const offsetX = Math.cos(angle) * initialOffset;
            const offsetY = Math.sin(angle) * initialOffset;
            
            particle.style.left = `${x + offsetX}px`;
            particle.style.top = `${y + offsetY}px`;

            // Add to grid and remove after animation
            this.gridElement.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // Create pixel dust particles
    createPixelDust() {
        const container = document.body;
        const numParticles = 50;
    
        for (let i = 0; i < numParticles; i++) {
            const dust = document.createElement('div');
            dust.className = 'pixel-dust';
            dust.style.left = `${Math.random() * 100}vw`;
            dust.style.top = `${Math.random() * 100}vh`;
            
            // Random size between 2px and 8px
            const size = 2 + Math.random() * 6;
            dust.style.setProperty('--size', `${size}px`);
            
            // Random movement direction
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            dust.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            dust.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            
            // Random animation duration and delay
            const duration = 10 + Math.random() * 20;
            dust.style.animationDuration = `${duration}s`;
            dust.style.animationDelay = `-${Math.random() * duration}s`;
            
            container.appendChild(dust);
    
            // Remove and recreate particle when animation ends
            dust.addEventListener('animationend', () => {
                dust.remove();
                container.appendChild(dust);
            });
        }
    }

    async submitWord() {
        if (this.currentWord.length < 3) {
            this.showMessage('Word too short!', 'error');
            this.showTilesFeedback('error');
            return;
        }

        if (this.usedWords.has(this.currentWord)) {
            this.showMessage('Word already used!', 'error');
            this.showTilesFeedback('duplicate');
            return;
        }

        // First check if the word is in our local wordList
        if (!this.wordList.includes(this.currentWord)) {
            this.showMessage('Not a valid word!', 'error');
            this.showTilesFeedback('error');
            return;
        }

        // Check if word is in cache
        if (this.wordCache.has(this.currentWord)) {
            this.handleWordValidation(this.wordCache.get(this.currentWord));
            return;
        }

        try {
            this.showMessage('Getting word information...', 'info');
            
            // Get word definition from Gemini
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${this.GEMINI_MODEL}:generateContent?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `For the word "${this.currentWord.toLowerCase()}", provide:
1. Part of speech (noun, verb, adjective, etc.)
2. Clear, concise definition

Format:
part_of_speech: [part of speech]
definition: [definition]`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to get word information');
            }

            // Parse Gemini response
            const responseText = data.candidates[0].content.parts[0].text;
            const lines = responseText.split('\n');
            const wordInfo = {
                word: this.currentWord,
                definitions: [{
                    partOfSpeech: lines[0].split(':')[1]?.trim() || 'unknown',
                    definition: lines[1].split(':')[1]?.trim() || 'Definition not available',
                    example: ''
                }]
            };

            this.wordCache.set(this.currentWord, wordInfo);
            this.handleWordValidation(wordInfo);

        } catch (error) {
            console.error('Error:', error);
            // Accept the word even if Gemini API fails, since it's in our local dictionary
            this.handleWordValidation({
                word: this.currentWord,
                definitions: [{
                    partOfSpeech: 'unknown',
                    definition: 'Definition not available',
                    example: ''
                }]
            });
        }
    }

    extractWordInfo(data) {
        const entry = data[0];
        return {
            word: entry.word,
            phonetic: entry.phonetic || '',
            definitions: entry.meanings.map(meaning => ({
                partOfSpeech: meaning.partOfSpeech,
                definition: meaning.definitions[0].definition,
                example: meaning.definitions[0].example
            }))
        };
    }

    async handleWordValidation(wordInfo) {
        try {
            // Add word to used words set
            this.usedWords.add(wordInfo.word);

            // Update score and display with animation
            this.score += wordInfo.word.length;
            this.wordsFound++;
            
            // Animate score
            this.scoreElement.textContent = this.score;
            this.scoreElement.classList.add('animate');
            setTimeout(() => this.scoreElement.classList.remove('animate'), 500);
            
            // Animate words found
            this.wordsFoundElement.textContent = this.wordsFound;
            this.wordsFoundElement.classList.add('animate');
            setTimeout(() => this.wordsFoundElement.classList.remove('animate'), 500);

            // Show success message
            this.showMessage('Word found!', 'success');
            this.showTilesFeedback('success');

            // Show word info panel if it's the first word
            const wordInfoPanel = document.getElementById('wordInfoPanel');
            if (!wordInfoPanel.classList.contains('visible')) {
                wordInfoPanel.classList.add('visible');
            }

            // Update word info panel
            this.wordInfoTitle.textContent = wordInfo.word;
            const definitionText = wordInfo.definitions[0].definition;
            const exampleText = wordInfo.definitions[0].example;

            // Show visualization container
            if (this.visualizationContainer) {
                this.visualizationContainer.style.display = 'flex';
            }

            // Generate emoji art using both word and definition
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${this.GEMINI_MODEL}:generateContent?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Create a simple emoji art that tells a fun story that represents the word "${wordInfo.word.toLowerCase()}".
Word definition: ${definitionText}

Requirements:
1. Use only emojis (no text)
2. Create a small, visually appealing composition
3. Make it directly related to the word's meaning
4. Use 5-6 lines maximum
5. Keep each line under 8 emojis
6. Format: Return ONLY the emoji art, no explanations`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            const data = await response.json();
            let emojiArt = '🎯';

            if (response.ok) {
                emojiArt = data.candidates[0].content.parts[0].text.trim();
            }

            // Clear existing visualization container
            if (this.visualizationContainer) {
                this.visualizationContainer.innerHTML = '';
            }

            // Create and append emoji art to visualization container
            const emojiArtContainer = document.createElement('div');
            emojiArtContainer.className = 'emoji-art';
            emojiArtContainer.innerHTML = emojiArt;
            this.visualizationContainer.appendChild(emojiArtContainer);

            // Add animation to emoji art lines
            const emojiLines = emojiArtContainer.innerHTML.split('\n');
            emojiArtContainer.innerHTML = '';
            emojiLines.forEach((line, index) => {
                const lineElement = document.createElement('div');
                lineElement.className = 'emoji-line';
                lineElement.textContent = line;
                lineElement.style.animationDelay = `${index * 0.2}s`;
                emojiArtContainer.appendChild(lineElement);
            });

            // Display word information
            let infoContent = `<p><strong>Definition:</strong> ${definitionText}</p>`;
            if (exampleText) {
                infoContent += `<p><strong>Example:</strong> ${exampleText}</p>`;
            }
            this.wordInfoContent.innerHTML = infoContent;

        } catch (error) {
            console.error('Error in handleWordValidation:', error);
        } finally {
            this.clearSelection();
        }
    }

    updateWordInfoPanel(wordInfo) {
        try {
            // Get just the first definition
            const firstDef = wordInfo.definitions[0];
            
            // Update the word info content with safe fallbacks
            this.wordInfoContent.innerHTML = `
                <div class="word-info-text">
                    ${wordInfo.phonetic ? `<div class="phonetic">${wordInfo.phonetic}</div>` : ''}
                    <div class="definition-container">
                        <div class="part-of-speech">${firstDef.partOfSpeech || 'unknown'}</div>
                        <div class="definition">${firstDef.definition || 'Definition not available'}</div>
                        ${firstDef.example ? `<div class="example">"${firstDef.example}"</div>` : ''}
                    </div>
                </div>
            `;
    
            // Generate visualization for the first definition
            this.generateVisualization(wordInfo.word, firstDef.definition || 'No definition available');
        } catch (error) {
            console.error('Error updating word info panel:', error);
            this.wordInfoContent.innerHTML = `
                <div class="word-info-text">
                    <div class="definition-container">
                        <div class="definition">Word information not available</div>
                    </div>
                </div>
            `;
        }
    }

    async generateVisualization(word) {
        try {
            // Show the visualization container
            if (this.visualizationContainer) {
                this.visualizationContainer.style.display = 'flex';
                this.visualizationContainer.innerHTML = '';
                if (this.currentSketch) {
                    this.currentSketch.remove();
                    this.currentSketch = null;
                }
            }
        
            // Get the word's definition from cache
            const wordInfo = this.wordCache.get(word);
            const definition = wordInfo?.definitions[0]?.definition || '';
        
            // Call Gemini AI to generate emoji art
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${this.GEMINI_MODEL}:generateContent?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Create an emoji art visualization for the word "${word}" (definition: "${definition}").
                            Requirements:
                            1. Use ONLY emojis to create a visual representation (no text or ASCII characters)
                            2. Maximum width of 10 emojis per line
                            3. Maximum height of 5 lines
                            4. The art should tell a story or represent the word's meaning
                            5. Make it centered and well-composed
                            6. Return only the emoji art, no explanations or extra spaces
                            7. Start your response immediately with the emoji art
                            
                            Example format (for the word "happy"):
                            🌟 ☀️ 🌟
                            ✨ 😊 ✨
                            🌸 💫 🌸`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });
        
            const data = await response.json();
            console.log('Gemini API Response:', data);
        
            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to generate visualization');
            }
        
            // Get the generated emoji art and trim any extra whitespace
            const emojiArt = data.candidates[0].content.parts[0].text.trim();
            console.log('Generated emoji art:', emojiArt);
        
            // Create container for emoji art
            const container = document.createElement('div');
            container.className = 'emoji-art';
            
            // Split the emoji art into lines and create elements for each line
            const lines = emojiArt.split('\n');
            lines.forEach((line, index) => {
                const lineElement = document.createElement('div');
                lineElement.className = 'emoji-line';
                lineElement.textContent = line;
                lineElement.style.animationDelay = `${index * 0.3}s`; // Stagger the animation
                container.appendChild(lineElement);
            });
            
            // Remove existing sketch if any
            if (this.currentSketch && this.currentSketch.parentNode) {
                this.currentSketch.remove();
            }
            
            // Clear the visualization container
            this.visualizationContainer.innerHTML = '';
            
            // Append the new container and update reference
            this.visualizationContainer.appendChild(container);
            this.currentSketch = container;
            
            // Force a reflow to trigger animations
            container.offsetHeight;
        
        } catch (error) {
            console.error('Error generating visualization:', error);
            this.showMessage('Error generating visualization: ' + error.message, 'error');
            this.visualizationContainer.innerHTML = '<div class="error-message">Failed to generate visualization</div>';
        }
    }

    showMessage(text, type) {
        // Only log to console for debugging
        console.log(`Game Message (${type}):`, text);
        
        // Clear the UI message
        this.messageElement.textContent = '';
    }

    showTilesFeedback(type) {
        // Add the feedback class to all selected tiles
        this.selectedTiles.forEach(tile => {
            tile.classList.add(type);
        });

        // Remove the feedback class and clear selection after delay
        setTimeout(() => {
            this.selectedTiles.forEach(tile => {
                tile.classList.remove(type);
            });
            this.clearSelection();
        }, 1000); // Shorter duration for error/duplicate feedback
    }

    clearSelection() {
        // Remove all connection lines
        this.connectionLines.forEach(line => line.remove());
        this.connectionLines = [];

        // Clear tile selection
        this.selectedTiles.forEach(tile => {
            tile.classList.remove('selected', 'success', 'error', 'duplicate');
        });
        this.selectedTiles = [];
        this.currentWord = '';
        this.currentWordElement.textContent = '';
    }

    updateScore(wordLength) {
        // Calculate score based on word length
        const baseScore = wordLength * 10;
        this.score += baseScore;
        
        // Update score display
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordGame();
});