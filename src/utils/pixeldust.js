export function createPixelDust() {
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