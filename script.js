const synth = window.speechSynthesis;
let currentUtterance = null;
let appVoices = [];

const body = document.body;
const voiceSelect = document.getElementById('voice-select');
const btnReadPage = document.getElementById('btn-read-page');
const btnStopRead = document.getElementById('btn-stop-read');

// 1. CARREGAMENTO E CONFIGURAÇÃO DE VOZES MULTIPERFIL
function setupVoices() {
    // Captura as vozes disponíveis no navegador
    appVoices = synth.getVoices();
}

if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = setupVoices;
}
setupVoices();

function getSelectedVoiceProfile() {
    const selectedProfile = voiceSelect.value;
    // Tenta encontrar vozes em Português no sistema do usuário
    const ptVoices = appVoices.filter(v => v.lang.includes('pt-BR') || v.lang.includes('pt-PT'));
    
    if (ptVoices.length === 0) return null;

    // Distribuição lógica para simular os 4 perfis pedidos com base nas vozes instaladas
    switch(selectedProfile) {
        case 'fem-1':
            return ptVoices[0]; // Primeira voz encontrada (comumente feminina padrão)
        case 'fem-2':
            return ptVoices[2] || ptVoices[0]; 
        case 'masc-1':
            return ptVoices[1] || ptVoices[0]; // Segunda voz encontrada (geralmente perfil alternativo/masculino)
        case 'masc-2':
            return ptVoices[3] || ptVoices[1] || ptVoices[0];
        default:
            return ptVoices[0];
    }
}

// LÓGICA DE SÍNTESE DE ÁUDIO
function speakTextContent(text) {
    if (synth.speaking) {
        synth.cancel();
    }

    if (!text || text.trim() === '') return;

    currentUtterance = new SpeechSynthesisUtterance(text);
    const configuredVoice = getSelectedVoiceProfile();
    
    if (configuredVoice) {
        currentUtterance.voice = configuredVoice;
    } else {
        currentUtterance.lang = 'pt-BR';
    }

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

// 2. CONTROLE DE TAMANHO DE FONTE FLUIDO
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

// 3. SELETOR DE MULTITEMAS (VERMELHO, VERDE, LARANJA, ROSA, ALTO CONTRASTE)
document.querySelectorAll('.theme-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const pickedTheme = e.target.getAttribute('data-theme');
        
        // Remove todas as classes de temas anteriores do body
        body.className = '';
        
        if (pickedTheme !== 'default') {
            body.classList.add('theme-' + pickedTheme);
        }
    });
});
