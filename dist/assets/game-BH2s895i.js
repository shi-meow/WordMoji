import"./modulepreload-polyfill-B5Qt9EMX.js";const E="modulepreload",w=function(u){return"/new-game-project/"+u},f={},y=function(t,e,n){let i=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),r=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));i=Promise.allSettled(e.map(a=>{if(a=w(a),a in f)return;f[a]=!0;const l=a.endsWith(".css"),c=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${c}`))return;const d=document.createElement("link");if(d.rel=l?"stylesheet":E,l||(d.as="script"),d.crossOrigin="",d.href=a,r&&d.setAttribute("nonce",r),document.head.appendChild(d),l)return new Promise((m,h)=>{d.addEventListener("load",m),d.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${a}`)))})}))}function o(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return i.then(s=>{for(const r of s||[])r.status==="rejected"&&o(r.reason);return t().catch(o)})};class v{constructor(){this.isInitialized=!1}initializeGameComponents(){this.isInitialized||(this.isInitialized=!0,y(async()=>{const{initCursor:t,addCursorHoverEffect:e}=await import("./cursor-CKUp-3ic.js");return{initCursor:t,addCursorHoverEffect:e}},[]).then(({initCursor:t,addCursorHoverEffect:e})=>{t();const n=document.querySelectorAll(".tile");e(n)}),this.GRID_SIZE={x:5,y:5},this.LETTER_DISTRIBUTION={A:12,B:3,C:3,D:4,E:15,F:2,G:3,H:3,I:10,J:1,K:1,L:6,M:3,N:8,O:10,P:3,Q:1,R:8,S:8,T:8,U:5,V:2,W:2,X:1,Y:3,Z:1},this.DIRECTIONS=[[0,1],[1,0],[1,1],[1,-1],[-1,1],[-1,-1],[-1,0],[0,-1]],this.wordList=[],this.score=0,this.wordsFound=0,this.currentWord="",this.selectedTiles=[],this.usedWords=new Set,this.wordCache=new Map,this.grid=[],this.isDragging=!1,this.connectionLines=[],this.gridElement=document.getElementById("grid"),this.currentWordElement=document.getElementById("currentWord"),this.messageElement=document.getElementById("message"),this.scoreElement=document.getElementById("score"),this.wordsFoundElement=document.getElementById("wordsFound"),this.totalWordsElement=document.getElementById("totalWords"),this.wordInfoContent=document.getElementById("wordInfoContent"),this.wordInfoTitle=document.getElementById("wordInfoTitle"),this.currentSketch=null,this.visualizationContainer=document.getElementById("visualization-container"),this.GEMINI_API_KEY="AIzaSyBlR1nRDfg0GvfuxKs8suaAOxRVdIfHKwU",this.GEMINI_MODEL="models/gemini-2.0-flash",this.visualizationContainer.style.width="100%",this.visualizationContainer.style.minHeight="200px",this.visualizationContainer.style.height="auto",this.visualizationContainer.style.marginTop="20px",this.visualizationContainer.style.display="none",this.visualizationContainer.style.justifyContent="center",this.visualizationContainer.style.alignItems="center",this.createPixelDust(),this.initializeGame(),this.initializeWordInfoPanel())}initializeWordInfoPanel(){document.getElementById("wordInfoPanel").classList.remove("hidden"),this.wordInfoTitle.textContent="How to Play",this.wordInfoContent.innerHTML=`
            <div class="game-instructions">
                <p>🎯 Find words by connecting adjacent letters in any direction.</p>
                <p>📝 Words must be 3-5 letters long.</p>
                <p>🌟 Each letter can be used only once per word.</p>
                <p>✨ Score points based on word length!</p>
                <p>🎮 Click and drag to select letters.</p>
                <p>🎨 Get a unique emoji art for each word you find!</p>
            </div>
        `}async initializeGame(){let t=0;do await this.loadWordList(),this.initializeEmptyGrid(),this.placeWordsInGrid(),this.fillEmptySpaces(),t=(await this.findAllPossibleWords()).length,t<50&&console.log("Not enough possible words found, regenerating grid...");while(t<50);for(let e=0;e<this.GRID_SIZE.y;e++)for(let n=0;n<this.GRID_SIZE.x;n++)this.createTile(n,e,this.grid[e][n]);this.gridElement.style.display="grid",this.wordsFound=0,this.wordsFoundElement.textContent="0",this.setupEventListeners(),window.parent&&window.parent.postMessage&&window.parent.postMessage("gameInitialized","*")}async findAllPossibleWords(){(!this.wordList||this.wordList.length===0)&&await this.loadWordList(),console.log("Word list loaded, length:",this.wordList.length),console.log("Current grid state:",this.grid);const t=Array(this.GRID_SIZE.y).fill().map(()=>Array(this.GRID_SIZE.x).fill(!1)),e=new Set;for(let i=0;i<this.GRID_SIZE.y;i++)for(let o=0;o<this.GRID_SIZE.x;o++)this.searchWords(o,i,"",t,e);const n=[...e].filter(i=>this.wordList.includes(i));return console.log("All possible words in this grid:",n),this.totalWordsElement&&(this.totalWordsElement.textContent=n.length),n}searchWords(t,e,n,i,o){if(t<0||t>=this.GRID_SIZE.x||e<0||e>=this.GRID_SIZE.y||i[e][t])return;const s=n+this.grid[e][t];if(s.length>=3&&s.length<=5&&this.wordList.includes(s)&&o.add(s),s.length>=5)return;i[e][t]=!0;const r=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];for(const[a,l]of r)this.searchWords(t+a,e+l,s,i,o);i[e][t]=!1}async loadWordList(){try{console.log("Starting to load word list...");const e=await(await fetch("words_alpha.txt")).text();console.log("Word list file loaded, processing..."),this.wordList=e.split(`
`).map(n=>n.trim()).filter(n=>n.length>=3&&n.length<=5).map(n=>n.toUpperCase()),console.log(`Word list processed. Total valid words: ${this.wordList.length}`),console.log("Sample of words:",this.wordList.slice(0,5))}catch(t){console.error("Error loading word list:",t),this.wordList=[]}}initializeEmptyGrid(){this.grid=Array(this.GRID_SIZE.y).fill().map(()=>Array(this.GRID_SIZE.x).fill(" ")),console.log("Initial empty grid:",this.grid)}placeWordsInGrid(){const t=[...this.wordList].sort(()=>Math.random()-.5),e=new Set;for(const n of t){if(e.size>=5)break;for(const[i,o]of this.DIRECTIONS)if(this.tryPlaceWord(n,i,o)){e.add(n);break}}console.log("Grid after placing words:",this.grid),console.log("Placed words:",[...e])}tryPlaceWord(t,e,n){t.length;for(let i=0;i<this.GRID_SIZE.y;i++)for(let o=0;o<this.GRID_SIZE.x;o++)if(this.canPlaceWord(t,o,i,e,n))return this.placeWord(t,o,i,e,n),!0;return!1}canPlaceWord(t,e,n,i,o){const s=t.length,r=e+(s-1)*i,a=n+(s-1)*o;if(r<0||r>=this.GRID_SIZE.x||a<0||a>=this.GRID_SIZE.y)return!1;for(let l=0;l<s;l++){const c=e+l*i,d=n+l*o,m=this.grid[d][c];if(m!==" "&&m!==t[l])return!1}return!0}placeWord(t,e,n,i,o){for(let s=0;s<t.length;s++){const r=e+s*i,a=n+s*o;this.grid[a][r]=t[s]}}fillEmptySpaces(){const t=this.createLetterPool();for(let e=0;e<this.GRID_SIZE.y;e++)for(let n=0;n<this.GRID_SIZE.x;n++)if(this.grid[e][n]===" "||this.grid[e][n]==="\r"){const i=Math.floor(Math.random()*t.length);this.grid[e][n]=t.splice(i,1)[0]}console.log("Final grid after filling empty spaces:",this.grid)}createLetterPool(){const t=[];for(const[e,n]of Object.entries(this.LETTER_DISTRIBUTION))for(let i=0;i<n;i++)t.push(e);return t}createTile(t,e,n){const i=document.createElement("div");i.className="tile",i.dataset.x=t,i.dataset.y=e,i.textContent=this.grid[e][t],i.letter=this.grid[e][t],this.gridElement.appendChild(i),i.addEventListener("touchstart",o=>{o.preventDefault(),this.handleTileSelection(i)}),i.addEventListener("touchmove",o=>{o.preventDefault();const s=o.touches[0],r=document.elementFromPoint(s.clientX,s.clientY);r&&r.classList.contains("tile")&&this.handleTileSelection(r)})}searchWords(t,e,n,i,o){if(t<0||t>=this.GRID_SIZE.x||e<0||e>=this.GRID_SIZE.y||i[e][t])return;const s=n+this.grid[e][t];if(s.length>=3&&s.length<=5&&this.wordList.includes(s)&&o.add(s),s.length>=5)return;i[e][t]=!0;const r=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];for(const[a,l]of r)this.searchWords(t+a,e+l,s,i,o);i[e][t]=!1}setupEventListeners(){this.gridElement.addEventListener("mousedown",t=>{t.target.classList.contains("tile")&&(this.isDragging=!0,this.handleTileSelection(t.target))}),document.addEventListener("mouseup",()=>{this.isDragging&&(this.isDragging=!1,this.currentWord.length>=3?this.submitWord():this.clearSelection())}),this.gridElement.addEventListener("mouseover",t=>{this.isDragging&&t.target.classList.contains("tile")&&this.handleTileSelection(t.target)})}handleTileSelection(t){if(this.selectedTiles.length>1&&t===this.selectedTiles[this.selectedTiles.length-2]){this.selectedTiles.pop().classList.remove("selected"),this.currentWord=this.currentWord.slice(0,-1),this.currentWordElement.textContent=this.currentWord;return}if(this.selectedTiles.length>0&&t===this.selectedTiles[this.selectedTiles.length-1]){this.selectedTiles.pop(),t.classList.remove("selected"),this.currentWord=this.currentWord.slice(0,-1),this.currentWordElement.textContent=this.currentWord;return}if(!this.selectedTiles.includes(t)){if(this.selectedTiles.length>0){const e=this.selectedTiles[this.selectedTiles.length-1];if(!this.isAdjacent(e,t))return}if(t.classList.add("selected"),this.selectedTiles.push(t),this.currentWord+=t.textContent,this.currentWordElement.textContent=this.currentWord,this.selectedTiles.length>=2){const e=this.selectedTiles[this.selectedTiles.length-2];this.drawConnectionLine(e,t)}}}isAdjacent(t,e){const n=parseInt(t.dataset.x),i=parseInt(t.dataset.y),o=parseInt(e.dataset.x),s=parseInt(e.dataset.y);return Math.abs(n-o)<=1&&Math.abs(i-s)<=1}drawConnectionLine(t,e){const n=t.getBoundingClientRect(),i=e.getBoundingClientRect(),o=this.gridElement.getBoundingClientRect(),s=(n.left+n.right)/2-o.left,r=(n.top+n.bottom)/2-o.top,a=(i.left+i.right)/2-o.left,l=(i.top+i.bottom)/2-o.top,c=document.createElement("div");c.className="connection-line";const d=Math.sqrt(Math.pow(a-s,2)+Math.pow(l-r,2)),m=Math.atan2(l-r,a-s);c.style.width=`${d}px`,c.style.left=`${s}px`,c.style.top=`${r}px`,c.style.transform=`rotate(${m}rad)`,c.style.transformOrigin="0 0",this.gridElement.appendChild(c),this.connectionLines.push(c),this.createParticles(s,r,a,l)}createParticles(t,e,n,i){for(let r=0;r<24;r++){const a=r/23+(Math.random()*.1-.05),l=t+(n-t)*a,c=e+(i-e)*a,d=document.createElement("div");d.className="particle";const m=15*Math.random(),h=Math.random()*Math.PI*2,p=Math.cos(h)*m,g=Math.sin(h)*m;d.style.left=`${l+p}px`,d.style.top=`${c+g}px`,this.gridElement.appendChild(d),setTimeout(()=>d.remove(),1e3)}}createPixelDust(){const t=document.body,e=50;for(let n=0;n<e;n++){const i=document.createElement("div");i.className="pixel-dust",i.style.left=`${Math.random()*100}vw`,i.style.top=`${Math.random()*100}vh`;const o=2+Math.random()*6;i.style.setProperty("--size",`${o}px`);const s=Math.random()*Math.PI*2,r=50+Math.random()*150;i.style.setProperty("--tx",`${Math.cos(s)*r}px`),i.style.setProperty("--ty",`${Math.sin(s)*r}px`);const a=10+Math.random()*20;i.style.animationDuration=`${a}s`,i.style.animationDelay=`-${Math.random()*a}s`,t.appendChild(i),i.addEventListener("animationend",()=>{i.remove(),t.appendChild(i)})}}async submitWord(){var t,e,n;if(this.currentWord.length<3){this.showMessage("Word too short!","error"),this.showTilesFeedback("error");return}if(this.usedWords.has(this.currentWord)){this.showMessage("Word already used!","error"),this.showTilesFeedback("duplicate");return}if(!this.wordList.includes(this.currentWord)){this.showMessage("Not a valid word!","error"),this.showTilesFeedback("error");return}if(this.wordCache.has(this.currentWord)){this.handleWordValidation(this.wordCache.get(this.currentWord));return}try{this.showMessage("Getting word information...","info");const i=await fetch(`https://generativelanguage.googleapis.com/v1beta/${this.GEMINI_MODEL}:generateContent?key=${this.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`For the word "${this.currentWord.toLowerCase()}", provide:
1. Part of speech (noun, verb, adjective, etc.)
2. Clear, concise definition

Format:
part_of_speech: [part of speech]
definition: [definition]`}]}],generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:1024}})}),o=await i.json();if(!i.ok)throw new Error(((t=o.error)==null?void 0:t.message)||"Failed to get word information");const r=o.candidates[0].content.parts[0].text.split(`
`),a={word:this.currentWord,definitions:[{partOfSpeech:((e=r[0].split(":")[1])==null?void 0:e.trim())||"unknown",definition:((n=r[1].split(":")[1])==null?void 0:n.trim())||"Definition not available",example:""}]};this.wordCache.set(this.currentWord,a),this.handleWordValidation(a)}catch(i){console.error("Error:",i),this.handleWordValidation({word:this.currentWord,definitions:[{partOfSpeech:"unknown",definition:"Definition not available",example:""}]})}}extractWordInfo(t){const e=t[0];return{word:e.word,phonetic:e.phonetic||"",definitions:e.meanings.map(n=>({partOfSpeech:n.partOfSpeech,definition:n.definitions[0].definition,example:n.definitions[0].example}))}}async handleWordValidation(t){try{this.usedWords.add(t.word),this.score+=t.word.length,this.wordsFound++,this.scoreElement.textContent=this.score,this.scoreElement.classList.add("animate"),setTimeout(()=>this.scoreElement.classList.remove("animate"),500),this.wordsFoundElement.textContent=this.wordsFound,this.wordsFoundElement.classList.add("animate"),setTimeout(()=>this.wordsFoundElement.classList.remove("animate"),500),this.showMessage("Word found!","success"),this.showTilesFeedback("success");const e=document.getElementById("wordInfoPanel");e.classList.contains("visible")||e.classList.add("visible"),this.wordInfoTitle.textContent=t.word;const n=t.definitions[0].definition,i=t.definitions[0].example;this.visualizationContainer&&(this.visualizationContainer.style.display="flex");const o=await fetch(`https://generativelanguage.googleapis.com/v1beta/${this.GEMINI_MODEL}:generateContent?key=${this.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`Create a simple emoji art that tells a fun story that represents the word "${t.word.toLowerCase()}".
Word definition: ${n}

Requirements:
1. Use only emojis (no text)
2. Create a small, visually appealing composition
3. Make it directly related to the word's meaning
4. Use 5-6 lines maximum
5. Keep each line under 8 emojis
6. Format: Return ONLY the emoji art, no explanations`}]}],generationConfig:{temperature:.9,topK:40,topP:.95,maxOutputTokens:1024}})}),s=await o.json();let r="🎯";o.ok&&(r=s.candidates[0].content.parts[0].text.trim()),this.visualizationContainer&&(this.visualizationContainer.innerHTML="");const a=document.createElement("div");a.className="emoji-art",a.innerHTML=r,this.visualizationContainer.appendChild(a);const l=a.innerHTML.split(`
`);a.innerHTML="",l.forEach((d,m)=>{const h=document.createElement("div");h.className="emoji-line",h.textContent=d,h.style.animationDelay=`${m*.2}s`,a.appendChild(h)});let c=`<p><strong>Definition:</strong> ${n}</p>`;i&&(c+=`<p><strong>Example:</strong> ${i}</p>`),this.wordInfoContent.innerHTML=c}catch(e){console.error("Error in handleWordValidation:",e)}finally{this.clearSelection()}}updateWordInfoPanel(t){try{const e=t.definitions[0];this.wordInfoContent.innerHTML=`
                <div class="word-info-text">
                    ${t.phonetic?`<div class="phonetic">${t.phonetic}</div>`:""}
                    <div class="definition-container">
                        <div class="part-of-speech">${e.partOfSpeech||"unknown"}</div>
                        <div class="definition">${e.definition||"Definition not available"}</div>
                        ${e.example?`<div class="example">"${e.example}"</div>`:""}
                    </div>
                </div>
            `,this.generateVisualization(t.word,e.definition||"No definition available")}catch(e){console.error("Error updating word info panel:",e),this.wordInfoContent.innerHTML=`
                <div class="word-info-text">
                    <div class="definition-container">
                        <div class="definition">Word information not available</div>
                    </div>
                </div>
            `}}async generateVisualization(t){var e,n;try{this.visualizationContainer&&(this.visualizationContainer.style.display="flex",this.visualizationContainer.innerHTML="",this.currentSketch&&(this.currentSketch.remove(),this.currentSketch=null));const i=this.wordCache.get(t),o=((e=i==null?void 0:i.definitions[0])==null?void 0:e.definition)||"",s=await fetch(`https://generativelanguage.googleapis.com/v1beta/${this.GEMINI_MODEL}:generateContent?key=${this.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:`Create an emoji art visualization for the word "${t}" (definition: "${o}").
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
                            🌸 💫 🌸`}]}],generationConfig:{temperature:.9,topK:40,topP:.95,maxOutputTokens:1024}})}),r=await s.json();if(console.log("Gemini API Response:",r),!s.ok)throw new Error(((n=r.error)==null?void 0:n.message)||"Failed to generate visualization");const a=r.candidates[0].content.parts[0].text.trim();console.log("Generated emoji art:",a);const l=document.createElement("div");l.className="emoji-art",a.split(`
`).forEach((d,m)=>{const h=document.createElement("div");h.className="emoji-line",h.textContent=d,h.style.animationDelay=`${m*.3}s`,l.appendChild(h)}),this.currentSketch&&this.currentSketch.parentNode&&this.currentSketch.remove(),this.visualizationContainer.innerHTML="",this.visualizationContainer.appendChild(l),this.currentSketch=l,l.offsetHeight}catch(i){console.error("Error generating visualization:",i),this.showMessage("Error generating visualization: "+i.message,"error"),this.visualizationContainer.innerHTML='<div class="error-message">Failed to generate visualization</div>'}}showMessage(t,e){console.log(`Game Message (${e}):`,t),this.messageElement.textContent=""}showTilesFeedback(t){this.selectedTiles.forEach(e=>{e.classList.add(t)}),setTimeout(()=>{this.selectedTiles.forEach(e=>{e.classList.remove(t)}),this.clearSelection()},1e3)}clearSelection(){this.connectionLines.forEach(t=>t.remove()),this.connectionLines=[],this.selectedTiles.forEach(t=>{t.classList.remove("selected","success","error","duplicate")}),this.selectedTiles=[],this.currentWord="",this.currentWordElement.textContent=""}updateScore(t){const e=t*10;this.score+=e,this.scoreElement&&(this.scoreElement.textContent=this.score)}}document.addEventListener("DOMContentLoaded",()=>{});window.initGame=()=>{new v().initializeGameComponents()};
