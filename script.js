let allEntries = [];
let filteredEntries = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        allEntries = await response.json();
        
        // Ordenar as entradas por data (mais recentes primeiro)
        allEntries.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        filteredEntries = [...allEntries];
        renderEntries(filteredEntries);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function renderEntries(entries) {
    const container = document.getElementById('log-container');
    container.innerHTML = '';

    if (entries.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #a8dadc;">Nenhuma entrada encontrada.</div>';
        return;
    }

    entries.forEach((entry, index) => {
        const entryEl = document.createElement('div');
        entryEl.className = 'log-entry';
        entryEl.style.animationDelay = `${index * 0.1}s`;

        let mediaHTML = '';
        if (entry.midia && entry.midia.length > 0) {
            mediaHTML = renderMediaCarousel(entry.midia, entry.id);
        }

        entryEl.innerHTML = `
            <div class="entry-header">
                <span class="entry-date">${entry.data_exibicao}</span>
                <h2 class="entry-title">${entry.titulo}</h2>
            </div>
            <div class="entry-content">${entry.conteudo}</div>
            ${mediaHTML}
            <div class="tags">
                ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;

        container.appendChild(entryEl);
    });

    initializeCarousels();
}

function renderMediaCarousel(mediaArray, entryId) {
    if (mediaArray.length === 0) return '';

    if (mediaArray.length === 1) {
        const media = mediaArray[0];
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(media);
        const tag = isImage ? 'img' : 'video';
        const attrs = isImage ? `src="${media}" alt="Mídia"` : `src="${media}" controls`;
        return `<div class="entry-media single-media"><${tag} ${attrs} /></div>`;
    }

    let html = `
        <div class="entry-media">
            <div class="carousel" id="carousel-${entryId}">
                <div class="carousel-wrapper">
                    <div class="carousel-track">
    `;

    mediaArray.forEach((media, idx) => {
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(media);
        const tag = isImage ? 'img' : 'video';
        const attrs = isImage ? `src="${media}" alt="Mídia ${idx + 1}"` : `src="${media}" controls`;
        html += `<div class="carousel-slide"><${tag} ${attrs} /></div>`;
    });

    html += `
                    </div>
                </div>
                <div class="carousel-controls">
                    <button class="carousel-button prev" data-carousel="carousel-${entryId}">❮</button>
                    <button class="carousel-button next" data-carousel="carousel-${entryId}">❯</button>
                </div>
                <div class="carousel-indicators">
    `;

    mediaArray.forEach((_, idx) => {
        html += `<button class="carousel-dot ${idx === 0 ? 'active' : ''}" data-carousel="carousel-${entryId}" data-slide="${idx}"></button>`;
    });

    html += `
                </div>
            </div>
        </div>
    `;

    return html;
}

function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        const carouselId = carousel.id;
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.parentElement.querySelectorAll('.carousel-dot');
        const prevBtn = carousel.querySelector('.carousel-button.prev');
        const nextBtn = carousel.querySelector('.carousel-button.next');

        let currentSlide = 0;
        const totalSlides = slides.length;

        function updateCarousel() {
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlide);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                currentSlide = idx;
                updateCarousel();
            });
        });

        let autoplayInterval = setInterval(nextSlide, 5000);

        carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        carousel.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(nextSlide, 5000);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    const searchInfo = document.getElementById('searchInfo');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        clearBtn.classList.toggle('active', query.length > 0);

        if (query.length === 0) {
            filteredEntries = [...allEntries];
            searchInfo.textContent = '';
        } else {
            filteredEntries = allEntries.filter(entry => {
                const titleMatch = entry.titulo.toLowerCase().includes(query);
                const contentMatch = entry.conteudo.toLowerCase().includes(query);
                const dateMatch = entry.data_exibicao.includes(query);
                const tagsMatch = entry.tags.some(tag => tag.toLowerCase().includes(query));
                return titleMatch || contentMatch || dateMatch || tagsMatch;
            });

            const count = filteredEntries.length;
            searchInfo.textContent = `${count} resultado${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
        }

        renderEntries(filteredEntries);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearBtn.classList.remove('active');
        filteredEntries = [...allEntries];
        searchInfo.textContent = '';
        renderEntries(filteredEntries);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupSearch();
});
