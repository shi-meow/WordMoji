let e=null;function o(){if(e){e.style.display="block";return}document.body.style.cursor="none",e=document.createElement("div"),e.className="custom-cursor",document.body.appendChild(e),document.addEventListener("mousemove",n),document.addEventListener("mouseleave",()=>{e&&(e.style.display="none")}),document.addEventListener("mouseenter",()=>{e&&(e.style.display="block")})}function i(s){e&&s.forEach(t=>{t&&(t.addEventListener("mouseenter",()=>{e&&e.classList.add("hover")}),t.addEventListener("mouseleave",()=>{e&&e.classList.remove("hover")}))})}function n(s){if(!e)return;e.style.left=s.clientX+"px",e.style.top=s.clientY+"px";const t=document.elementFromPoint(s.clientX,s.clientY);t&&(t.classList.contains("tile")||t.classList.contains("game-button")||t.classList.contains("play-button")||t.classList.contains("loading-emoji")||t.closest(".play-button"))?e.classList.add("hover"):e.classList.remove("hover")}export{i as addCursorHoverEffect,o as initCursor};
