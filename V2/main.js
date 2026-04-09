let currentScreenIndex = 0;
let isAnimating = false;
let isProjectViewOpen = false;

document.addEventListener("DOMContentLoaded", () => {
    const screens = document.querySelectorAll('.screen');
    const totalScreens = screens.length;

    function navigate(direction) {
        if (isAnimating || isProjectViewOpen) return;

        let targetScreenIndex = currentScreenIndex;
        const currentScreen = screens[currentScreenIndex];

        if (currentScreen.classList.contains('carousel-section')) {
            const track = currentScreen.querySelector('.carousel-track');
            const slides = track.querySelectorAll('.slide');
            
            let currentSlideIndex = track.dataset.currentSlide ? parseInt(track.dataset.currentSlide) : 0;
            const slideWidth = slides[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(track).gap) || 0;
            const step = slideWidth + gap;

            if (direction === 1 && currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                animateCarousel(track, currentSlideIndex, step);
                return; 
            } else if (direction === -1 && currentSlideIndex > 0) {
                currentSlideIndex--;
                animateCarousel(track, currentSlideIndex, step);
                return; 
            }
        }

        if (direction === 1 && currentScreenIndex < totalScreens - 1) {
            targetScreenIndex = currentScreenIndex + 1;
        } else if (direction === -1 && currentScreenIndex > 0) {
            targetScreenIndex = currentScreenIndex - 1;
        }

        if (targetScreenIndex !== currentScreenIndex) {
            changeScreen(targetScreenIndex);
        }
    }

    function animateCarousel(track, index, step) {
        isAnimating = true;
        track.dataset.currentSlide = index;
        track.style.transform = `translateX(-${index * step}px)`;
        setTimeout(() => { isAnimating = false; }, 600);
    }

    function changeScreen(index) {
        isAnimating = true;
        currentScreenIndex = index;
        const container = document.getElementById('scroll-container');
        container.style.transform = `translateY(-${index * 100}vh)`;
        setTimeout(() => { isAnimating = false; }, 850); 
    }

    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 30) navigate(1);
        else if (e.deltaY < -30) navigate(-1);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') navigate(1);
        else if (e.key === 'ArrowUp') navigate(-1);
        else if (e.key === 'Escape' && isProjectViewOpen) {
            const layout = document.querySelector('.detail-layout');
            if(layout.classList.contains('interactive-mode')) {
                layout.classList.remove('interactive-mode');
                const closeBtn = document.getElementById('close-project-btn');
                if (closeBtn) closeBtn.style.display = 'block';
            } else {
                closeProject();
            }
        }
    });

    // --- INTERACTIVE MODE ---
    const enterFullscreenBtn = document.getElementById('enter-fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    if (enterFullscreenBtn) {
        enterFullscreenBtn.addEventListener('click', () => {
            document.querySelector('.detail-layout').classList.add('interactive-mode');
            const closeBtn = document.getElementById('close-project-btn');
            if (closeBtn) closeBtn.style.display = 'none';
        });
    }
    if (exitFullscreenBtn) {
        exitFullscreenBtn.addEventListener('click', () => {
            document.querySelector('.detail-layout').classList.remove('interactive-mode');
            const closeBtn = document.getElementById('close-project-btn');
            if (closeBtn) closeBtn.style.display = 'block';
        });
    }

    // --- MODALE DETAIL ---
    const detailView = document.getElementById('project-detail-view');
    const detailImg = document.getElementById('detail-hero-img');
    const closeBtn = document.getElementById('close-project-btn');

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            if (isAnimating) return;
            openProject(card);
        });

        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') openProject(card);
        });
    });

    function openProject(card) {
        isProjectViewOpen = true;

        // Data extraction
        const imgSrc = card.querySelector('.slide-bg').src;
        const title = card.querySelector('h3').innerText;
        const role = card.getAttribute('data-role') || "Direction Artistique";
        const tools = card.getAttribute('data-tools') || "Suite Adobe";
        const desc = card.getAttribute('data-desc') || "";
        const videoId = card.getAttribute('data-video-id');
        const pdfSrc = card.getAttribute('data-pdf-src');
        const webSrc = card.getAttribute('data-web-src');

        // Text insertion
        detailImg.src = imgSrc;
        document.getElementById('detail-title').innerText = title;
        document.getElementById('detail-role').innerText = role;
        document.getElementById('detail-tools').innerText = tools;
        document.getElementById('detail-desc').innerHTML = `<p>${desc}</p>`;

        // Media Handling
        const mediaArea = document.getElementById('detail-media-area');
        const mediaContainer = document.getElementById('media-container');

        // Reset interactive mode
        const detailLayout = document.querySelector('.detail-layout');
        detailLayout.classList.remove('interactive-mode');
        detailLayout.classList.remove('is-pdf');
        
        if (enterFullscreenBtn) enterFullscreenBtn.style.display = 'none';
        const closeBtnMode = document.getElementById('close-project-btn');
        if (closeBtnMode) closeBtnMode.style.display = 'block';

        // Reset mediaArea to default horizontal for Video / Web
        mediaArea.style.aspectRatio = '16 / 9';
        mediaArea.style.height = 'auto';
        mediaArea.style.width = '50%';

        if (videoId) {
            // Attendre la fin du FLIP pour charger l'iframe pour éviter les ralentissements
            setTimeout(() => {
                // Utilisation de youtube.com classique
                mediaContainer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }, 600);
            mediaArea.style.display = 'flex';
            document.querySelector('.detail-text-area').style.width = '45%';
        } else if (pdfSrc) {
            // Activer le mode spécifique aux PDFs
            document.querySelector('.detail-layout').classList.add('is-pdf');

            // Remove previous PDF gallery controls from text area if any
            const oldControls = document.getElementById('dynamic-pdf-gallery');
            if(oldControls) oldControls.remove();

            // Setup vertical viewer layout
            mediaArea.style.width = '45%';
            mediaArea.style.height = 'calc(100vh - 12rem)'; 
            mediaArea.style.marginTop = '2rem';
            mediaArea.style.aspectRatio = 'auto';
            mediaArea.style.maxWidth = 'none';
            mediaArea.style.background = 'transparent';
            mediaArea.style.boxShadow = 'none';
            mediaArea.style.position = 'relative';

            const pdfs = pdfSrc.split(',');
            const descsRaw = card.getAttribute('data-pdf-desc') || '';
            const descs = descsRaw ? descsRaw.split('|') : [];

            setTimeout(() => {
                let html = `<embed id="pdf-embed-viewer" src="${pdfs[0].trim()}" type="application/pdf" width="100%" height="100%" style="border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); display:block;"/>`;
                
                if (pdfs.length > 1) {
                    let navHtml = `
                    <div id="dynamic-pdf-gallery" style="margin-top: 2rem; background: rgba(0,0,0,0.85); padding: 0.5rem 1rem; border-radius: 50px; display: inline-flex; align-items: center; gap: 1rem; z-index: 50; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); align-self: flex-start;">
                        <button id="pdf-prev" style="background:none; border:none; color:#f4ecdf; font-size:1.5rem; cursor:pointer; padding:0 0.5rem; transition: transform 0.2s;">&#8249;</button>
                        <select id="pdf-select" style="background:transparent; color:#f4ecdf; border:none; outline:none; font-family:var(--font-heading); font-size:1.1rem; cursor:pointer; text-transform:uppercase;">
                            ${pdfs.map((p, i) => `<option value="${i}" style="color:black;">Affiche ${i + 1}</option>`).join('')}
                        </select>
                        <button id="pdf-next" style="background:none; border:none; color:#f4ecdf; font-size:1.5rem; cursor:pointer; padding:0 0.5rem; transition: transform 0.2s;">&#8250;</button>
                    </div>`;
                    
                    document.querySelector('.detail-text-area').insertAdjacentHTML('beforeend', navHtml);
                }

                mediaContainer.style.display = 'block';
                mediaContainer.innerHTML = html;

                if (pdfs.length > 1) {
                    const embed = document.getElementById('pdf-embed-viewer');
                    const select = document.getElementById('pdf-select');
                    const descContainer = document.querySelector('#detail-desc p');
                    const baseDesc = descContainer.innerHTML;
                    
                    let currentIdx = 0;
                    const updatePdf = (index) => {
                        currentIdx = (index + pdfs.length) % pdfs.length;
                        embed.setAttribute('src', pdfs[currentIdx].trim());
                        select.value = currentIdx;
                        
                        // Modifier la description si applicable
                        if (descs[currentIdx]) {
                            descContainer.innerHTML = descs[currentIdx].trim();
                        } else {
                            descContainer.innerHTML = baseDesc;
                        }
                    };

                    const resetTimer = () => {
                        if(window.pdfSlideInterval) clearInterval(window.pdfSlideInterval);
                        window.pdfSlideInterval = setInterval(() => updatePdf(currentIdx + 1), 6000);
                    };

                    select.addEventListener('change', (e) => {
                        updatePdf(parseInt(e.target.value));
                        resetTimer();
                    });
                    document.getElementById('pdf-prev').addEventListener('click', () => {
                        updatePdf(currentIdx - 1);
                        resetTimer();
                    });
                    document.getElementById('pdf-next').addEventListener('click', () => {
                        updatePdf(currentIdx + 1);
                        resetTimer();
                    });
                    
                    // Lancer la première description correcte
                    if (descs[0]) descContainer.innerHTML = descs[0].trim();
                     
                    resetTimer();
                }
            }, 600);
            mediaArea.style.display = 'flex';
            document.querySelector('.detail-text-area').style.width = '45%';
            if (enterFullscreenBtn) {
                enterFullscreenBtn.style.display = 'inline-block';
                enterFullscreenBtn.innerText = 'Lire le PDF en plein écran';
            }
        } else if (webSrc) {
            setTimeout(() => {
                mediaContainer.innerHTML = `<iframe width="100%" height="100%" src="${webSrc}" frameborder="0" style="background:#fff;"></iframe>`;
            }, 600);
            mediaArea.style.display = 'flex';
            document.querySelector('.detail-text-area').style.width = '45%';
            if (enterFullscreenBtn) {
                enterFullscreenBtn.style.display = 'inline-block';
                enterFullscreenBtn.innerText = 'Activer le mode lecteur interactif';
            }
        } else {
            mediaContainer.innerHTML = '';
            mediaArea.style.display = 'none';
            document.querySelector('.detail-text-area').style.width = '80%'; // Plus large sans vidéo
        }

        // FLIP Math
        const rect = card.getBoundingClientRect();
        detailImg.style.top = `${rect.top}px`;
        detailImg.style.left = `${rect.left}px`;
        detailImg.style.width = `${rect.width}px`;
        detailImg.style.height = `${rect.height}px`;
        
        detailView.classList.add('active');

        requestAnimationFrame(() => {
            detailImg.style.top = '0px';
            detailImg.style.left = '0px';
            detailImg.style.width = '100vw';
            detailImg.style.height = '100vh';
        });
    }

    function closeProject() {
        detailView.classList.remove('active');
        document.querySelector('.detail-layout').classList.remove('interactive-mode');
        
        // Coupe le son de la vidéo en vidant l'iframe immédiatement
        const mediaContainer = document.getElementById('media-container');
        if(mediaContainer) mediaContainer.innerHTML = '';
        
        // Remove active gallery controls
        const dynamicControls = document.getElementById('dynamic-pdf-gallery');
        if(dynamicControls) dynamicControls.remove();
        
        // Stop autoplay interval if active
        if(window.pdfSlideInterval) {
            clearInterval(window.pdfSlideInterval);
            window.pdfSlideInterval = null;
        }
        
        setTimeout(() => {
            isProjectViewOpen = false;
            detailImg.style.top = '';
            detailImg.style.left = '';
            detailImg.style.width = '';
            detailImg.style.height = '';
        }, 400); 
    }

    if (closeBtn) closeBtn.addEventListener('click', closeProject);
});
