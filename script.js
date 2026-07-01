// Inicialização da Web Speech API (Sintetizador de Voz do Navegador)
const synth = window.speechSynthesis;
let currentUtterance = null;

// Elementos da Interface
const body = document.body;
const btnIncrease = document.getElementById('btn-increase');
const btnDecrease = document.getElementById('btn-decrease');
const btnContrast = document.getElementById('btn-contrast');
const btnReadPage = document.getElementById('btn-read-page');
const btnStopRead = document.getElementById('btn-stop-read');
const btnReadSections = document.querySelectorAll('.btn-read-section');

// 1. Controlo de Tamanho da Fonte (Aumentar / Diminuir)
let fontSizeMultiplier = 100; // Percentagem inicial

function updateFontSize() {
    body.style.fontSize = fontSizeMultiplier + '%';
}

btnIncrease.addEventListener('click', () => {
    if (fontSizeMultiplier < 200) { // Limite máximo de 200% por segurança de layout
        fontSizeMultiplier += 15;
        updateFontSize();
    }
});

btnDecrease.addEventListener('click', () => {
    if (fontSizeMultiplier > 85) { // Limite mínimo de 85%
        fontSizeMultiplier -= 15;
        updateFontSize();
    }
});

// 2. Alternador de Alto Contraste
btnContrast.addEventListener('click', () => {
    body.classList.toggle('high-contrast');
});

// 3. Sistema de Leitura de Texto por Voz (Text-to-Speech)
function speakText(text) {
    // Se já houver algo a ser lido, para a leitura atual primeiro
    if (synth.speaking) {
        synth.cancel();
    }

    if (text.trim() === '') return;

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'pt-BR'; // Define o idioma para Português

    // Controla a visibilidade do botão de parar
    currentUtterance.onstart = () => {
        btnStopRead.classList.remove('hidden');
    };

    currentUtterance.onend = () => {
        btnStopRead.classList.add('hidden');
    };

    synth.speak(currentUtterance);
}

// Botão para interromper a voz a qualquer momento
btnStopRead.addEventListener('click', () => {
    if (synth.speaking) {
        synth.cancel();
        btnStopRead.classList.add('hidden');
    }
});

// Função para extrair e ler todo o conteúdo de texto legível da página
btnReadPage.addEventListener('click', () => {
    const mainContent = document.getElementById('main-content');
    // Captura apenas os textos limpos dentro do main (ignorando os botões de áudio)
    let pageText = document.querySelector('header').innerText + '. ';
    
    const paragraphsAndHeaders = mainContent.querySelectorAll('h2, p, li');
    paragraphsAndHeaders.forEach(element => {
        pageText += element.innerText + '. ';
    });

    speakText(pageText);
});

// Configuração dos botões de leitura individuais por secção
btnReadSections.forEach(button => {
    button.addEventListener('click', (event) => {
        // Encontra a secção pai mais próxima do botão clicado
        const parentSection = event.target.closest('section');
        
        // Pega os textos da secção, ignorando o texto do próprio botão
        let sectionText = parentSection.querySelector('h2').innerText + '. ';
        const elements = parentSection.querySelectorAll('p, li');
        
        elements.forEach(el => {
            sectionText += el.innerText + '. ';
        });

        speakText(sectionText);
    });
});
