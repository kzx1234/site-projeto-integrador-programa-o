const synth = window.speechSynthesis;
let currentUtterance = null;
let appVoices = [];

const body = document.body;
const voiceSelect = document.getElementById('voice-select');
const btnReadPage = document.getElementById('btn-read-page');
const btnStopRead = document.getElementById('btn-stop-read');

// 1. CARREGAMENTO DE VOZES DO SISTEMA
function setupVoices() {
    appVoices = synth.getVoices();
}
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = setupVoices;
}
setupVoices();

// 2. LÓGICA INTELIGENTE PARA MODIFICAR AS PROPRIEDADES DA VOZ
function applyVoiceProfile(utterance) {
    const selectedProfile = voiceSelect.value;
    const ptVoices = appVoices.filter(v => v.lang.includes('pt-BR') || v.lang.includes('pt-PT'));
    
    // Se houver mais de uma voz no sistema, tenta alternar entre elas
    if (ptVoices.length > 0) {
        if (selectedProfile.includes('fem') && ptVoices[0]) {
            utterance.voice = ptVoices[0];
        } else if (selectedProfile.includes('masc') && ptVoices[1]) {
            utterance.voice = ptVoices[1]; // Usa a segunda voz do sistema se disponível
        } else {
            utterance.voice = ptVoices[0];
        }
    }
    
    // MODIFICAÇÃO ARTIFICIAL (Garante a diferença mesmo se houver apenas 1 voz no sistema!)
    switch(selectedProfile) {
        case 'fem-1': // Feminina Padrão
            utterance.pitch = 1.2;  // Tom ligeiramente mais agudo
            utterance.rate = 1.0;   // Velocidade normal
            break;
        case 'fem-2': // Feminina Alternativa (Estilo Assistente Virtual)
            utterance.pitch = 1.4;  // Tom bem mais agudo
            utterance.rate = 1.15;  // Um pouco mais rápida
            break;
        case 'masc-1': // Masculina Principal
            utterance.pitch = 0.7;  // Tom mais grave/grosso
            utterance.rate = 0.95;  // Velocidade ligeiramente mais pausada
            break;
        case 'masc-2': // Masculina Alternativa
            utterance.pitch = 0.5;  // Tom extremamente grave
            utterance.rate = 1.0;   // Velocidade normal
            break;
        default:
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
    }
}

// LÓGICA DE SÍNTESE DE ÁUDIO
function speakTextContent(text) {
    if (synth.speaking) {
        synth.cancel();
    }

    if (!text || text.trim() === '') return;

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'pt-BR';
    
    // Aplica as modificações de tom e velocidade baseadas na opção escolhida
    applyVoiceProfile(currentUtterance);

    currentUtterance.onstart = () => btnStopRead.classList.remove('hidden');
    currentUtterance.onend = () => btnStopRead.classList.add('hidden');

    synth.speak(currentUtterance);
}

// INTERRUPÇÃO GLOBAL
btnStopRead.addEventListener('click', () => {
    if (synth.speaking) {
        synth.cancel();
        btnStopRead.classList.add('hidden');
    }
});

// LEITURA INTEGRAL DA PÁGINA
btnReadPage.addEventListener('click', () => {
    let fullText = document.querySelector('header h1').innerText + '. ' + document.querySelector('header p').innerText + '. ';
    const articles = document.querySelectorAll('main section');
    
    articles.forEach(sec => {
        fullText += sec.querySelector('h2').innerText + '. ';
        sec.querySelectorAll('p, li').forEach(el => {
            fullText += el.innerText + '. ';
        });
    });
    speakTextContent(fullText);
});

// LEITURA POR SEÇÃO INDIVIDUAL
document.querySelectorAll('.btn-read-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const currentSection = e.target.closest('section');
        let blockText = currentSection.querySelector('h2').innerText + '. ';
        currentSection.querySelectorAll('p, li').forEach(p => {
            blockText += p.innerText + '. ';
        });
        speakTextContent(blockText);
    });
});

// CONTROLE DE TAMANHO DE FONTE FLUIDO
let textScale = 100;
document.getElementById('btn-increase').addEventListener('click', () => {
    if (textScale < 180) {
        textScale += 15;
        body.style.setProperty('--font-scale', textScale + '%');
    }
});

document.getElementById('btn-decrease').addEventListener('click', () => {
    if (textScale > 85) {
        textScale -= 15;
        body.style.setProperty('--font-scale', textScale + '%');
    }
});

// SELETOR DE MULTITEMAS
document.querySelectorAll('.theme-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const pickedTheme = e.target.getAttribute('data-theme');
        body.className = '';
        if (pickedTheme !== 'default') {
            body.classList.add('theme-' + pickedTheme);
        }
    });
});

// 3. CONTROLE DE ZOOM ACESSÍVEL PARA A IMAGEM
const imageToZoom = document.getElementById('accessible-image');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');

if (imageToZoom && btnZoomIn && btnZoomOut) {
    // Ao clicar em aumentar, adiciona a classe CSS que amplia o max-width
    btnZoomIn.addEventListener('click', () => {
        imageToZoom.classList.add('is-expanded');
        btnZoomIn.setAttribute('aria-pressed', 'true');
        btnZoomOut.setAttribute('aria-pressed', 'false');
    });

    // Ao clicar em restaurar, remove a classe e volta ao tamanho inicial
    btnZoomOut.addEventListener('click', () => {
        imageToZoom.classList.remove('is-expanded');
        btnZoomIn.setAttribute('aria-pressed', 'false');
        btnZoomOut.setAttribute('aria-pressed', 'true');
    });
}
