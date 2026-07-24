/**
 * BrainMat - Gerenciador de Áudio Sintetizado (Web Audio API)
 * Inclui Efeitos Sonoros + Música Ambiente Sintetizada + Controle de Volume
 */

class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.isMuted = localStorage.getItem('brainmat_muted') === 'true';
        this.volume = parseFloat(localStorage.getItem('brainmat_volume') || '0.5');
        
        // Música ambiente
        this.bgMusicPlaying = false;
        this.bgMusicTimer = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        // Escala pentatônica relaxante (C4, D4, E4, G4, A4, C5, E5) para a música ambiente
        this.pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
    }

    init() {
        if (this.audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        this.audioCtx = new AudioContext();
        
        // Master Gain Node
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        this.masterGain.connect(this.audioCtx.destination);

        // Music Gain Node
        this.musicGain = this.audioCtx.createGain();
        this.musicGain.gain.value = 0.25; // Música ambiente suave
        this.musicGain.connect(this.masterGain);

        // SFX Gain Node
        this.sfxGain = this.audioCtx.createGain();
        this.sfxGain.gain.value = 0.8;
        this.sfxGain.connect(this.masterGain);
    }

    setMute(muted) {
        this.isMuted = muted;
        localStorage.setItem('brainmat_muted', muted);
        if (this.masterGain && this.audioCtx) {
            this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.audioCtx.currentTime);
        }
        if (muted) {
            this.stopBgMusic();
        } else {
            this.startBgMusic();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        localStorage.setItem('brainmat_volume', this.volume);
        if (this.masterGain && !this.isMuted && this.audioCtx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        }
    }

    playClick() {
        this.init();
        if (this.isMuted || !this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(480, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.warn('Erro ao tocar som click:', e);
        }
    }

    playCorrect() {
        this.init();
        if (this.isMuted || !this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            
            // Arpejo de notas felizes (C5 -> E5 -> G5)
            const notes = [523.25, 659.25, 783.99];
            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.06);

                gain.gain.setValueAtTime(0.001, now + i * 0.06);
                gain.gain.linearRampToValueAtTime(0.3, now + i * 0.06 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(now + i * 0.06);
                osc.stop(now + i * 0.06 + 0.25);
            });
        } catch (e) {
            console.warn('Erro ao tocar som correct:', e);
        }
    }

    playWrong() {
        this.init();
        if (this.isMuted || !this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(90, now + 0.25);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            console.warn('Erro ao tocar som wrong:', e);
        }
    }

    playLevelUp() {
        this.init();
        if (this.isMuted || !this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const notes = [440, 554.37, 659.25, 880]; // A Major Arpeggio
            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);

                gain.gain.setValueAtTime(0.4, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.35);
            });
        } catch (e) {
            console.warn('Erro ao tocar som levelUp:', e);
        }
    }

    playAchievement() {
        this.init();
        if (this.isMuted || !this.audioCtx) return;
        try {
            const now = this.audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Fanfare
            notes.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);

                gain.gain.setValueAtTime(0.35, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.4);
            });
        } catch (e) {
            console.warn('Erro ao tocar som achievement:', e);
        }
    }

    startBgMusic() {
        if (this.isMuted || this.bgMusicPlaying) return;
        this.init();
        if (!this.audioCtx) return;

        this.bgMusicPlaying = true;
        this.scheduleAmbientNote();
    }

    stopBgMusic() {
        this.bgMusicPlaying = false;
        if (this.bgMusicTimer) {
            clearTimeout(this.bgMusicTimer);
            this.bgMusicTimer = null;
        }
    }

    scheduleAmbientNote() {
        if (!this.bgMusicPlaying || this.isMuted || !this.audioCtx) return;

        try {
            const now = this.audioCtx.currentTime;
            const freq = this.pentatonicNotes[Math.floor(Math.random() * this.pentatonicNotes.length)];
            
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Ataque e decaimento ultra suaves
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
            gain.gain.linearRampToValueAtTime(0.001, now + 3.0);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(now);
            osc.stop(now + 3.2);

            // Agendar próxima nota em tempo aleatório suave (entre 1.8s e 3.2s)
            const nextDelay = 1800 + Math.random() * 1400;
            this.bgMusicTimer = setTimeout(() => this.scheduleAmbientNote(), nextDelay);
        } catch (e) {
            console.warn('Erro na música ambiente:', e);
        }
    }
}

export const soundManager = new SoundManager();
