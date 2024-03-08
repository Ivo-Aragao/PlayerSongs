// MusicPlayer com padrão Observer
class MusicPlayer {
    constructor() {
        this.observers = [];
        this.state = { songs: [], currentSongIndex: -1, playing: false, volume: 50 };
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers() {
        for (const observer of this.observers) {
            observer.update(this.state);
        }
    }

    play() {
        if (this.state.songs.length === 0) return; // No songs in the playlist
        const currentSong = this.state.songs[this.state.currentSongIndex];
        this.state.playing = true;
        this.notifyObservers();
        currentSong.audio.play();
    }

    pause() {
        if (this.state.currentSongIndex === -1) return;
        const currentSong = this.state.songs[this.state.currentSongIndex];
        this.state.playing = false;
        this.notifyObservers();
        currentSong.audio.pause();
    }

    stop() {
        this.pause();
        this.state.currentSongIndex = -1;
        this.notifyObservers();
    }

    setVolume(volume) {
        this.state.volume = volume;
        this.notifyObservers();
        if (this.state.playing && this.state.currentSongIndex !== -1) {
            const currentSong = this.state.songs[this.state.currentSongIndex];
            currentSong.audio.volume = volume / 100;
        }
    }

    addSong(song) {
        const audio = new Audio(song.src);
        song.audio = audio;
        this.state.songs.push(song);
        if (this.state.currentSongIndex === -1) {
            this.state.currentSongIndex = 0;
            this.notifyObservers();
        }
    }

    selectSong(index) {
        if (index < 0 || index >= this.state.songs.length) return;
        this.stop();
        this.state.currentSongIndex = index;
        this.play();
    }
}

// Song class to represent each song in the playlist
class Song {
    constructor(title, src, albumSrc) {
        this.title = title;
        this.src = src;
        this.albumSrc = albumSrc; // Novo atributo para o caminho da imagem do álbum
        this.audio = null;
    }
}

// Display implementa Observer para atualizar a interface do usuário
class Display {
    constructor(displayElement, volumeElement, playlistElement, player, albumElement) {
        this.displayElement = displayElement;
        this.volumeElement = volumeElement;
        this.playlistElement = playlistElement;
        this.player = player;
        this.albumElement = albumElement;
    }

    update(state) {
        if (state.playing) {
            this.displayElement.innerHTML = `Tocando agora: ${state.songs[state.currentSongIndex].title}`;
            const albumSrc = state.songs[state.currentSongIndex].albumSrc;
            this.albumElement.src = albumSrc;
            this.albumElement.style.display = 'block';
        } else {
            this.displayElement.innerHTML = "Música atual: Nenhuma";
            this.albumElement.style.display = 'none';
        }
        this.volumeElement.innerHTML = `Volume: ${state.volume}%`;
    }
}

// Código "cliente" que usa as classes
// Instanciando o player e o display
const player = new MusicPlayer();
const albumElement = document.getElementById('coverDisplay');
const display = new Display(
    document.getElementById('musicDisplay'),
    document.getElementById('volumeDisplay'),
    document.getElementById('playlist'),
    player,
    albumElement
);
player.addObserver(display);

// Adicionando músicas ao player
const songs = [
    new Song('Luke Combs - Fast Car (Lyrics)', 'Luke Combs - Fast Car (Lyrics).mp3', './assets/lukecombs.jpg'),
    new Song('Gusttavo Lima - Relação Errada Part. Bruno & Marrone _ DVD Paraíso Particular', 'Gusttavo Lima - Rela%C3%A7%C3%A3o Errada Part. Bruno %26 Marrone _ DVD Para%C3%ADso Particular.mp3', './assets/gustavolima.jpg'),
    new Song('Dino - Your Love (The Outfield) _ Rock e Flashback Acústico (Spotify & Deezer)', 'Dino - Your Love (The Outfield) _ Rock e Flashback Acústico (Spotify & Deezer).mp3', './assets/dino.jpg')
];

songs.forEach(song => {
    song.src = song.src.replace(/\s/g, '%20'); // Substitui espaços por %20
    player.addSong(song);
});
// Configurando listeners dos botões
document.getElementById('playButton').addEventListener('click', function() {
    player.play();
});

document.getElementById('stopButton').addEventListener('click', function() {
    player.stop();
});

// Seletor de música
document.getElementById('songSelector').addEventListener('change', function() {
    const selectedIndex = parseInt(this.value);
    if (selectedIndex !== -1) {
        player.selectSong(selectedIndex);
    }
});

// Controle de volume
document.getElementById('volumeControl').addEventListener('input', function() {
    const volume = parseInt(this.value);
    player.setVolume(volume);
});
