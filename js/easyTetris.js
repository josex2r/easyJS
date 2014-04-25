var audio = new window.webkitAudioContext(), position = 0, scale = {
	C : 261.63,
	D : 293.66,
	E : 329.63,
	F : 349.23,
	G : 392.00,
	A : 440.00,
	B : 493.88,
	c : 523.25, //c
	d : 587.33, //d
	e : 659.25, //E5
	f : 698.46, //F5
	g : 783.99, //F5
	a : 880.00, //A5
	o : 1

}, song = "e-Bcd-cBA-Ace-dcB--cd-e-c-A-A--d-fa-gfe--ce-dcB-Bcd-e-c-A-A----";

setInterval(play, (120 / 60) * 100);

function createOscillator(freq) {
	var attack = 10, decay = 250, gain = audio.createGain(), osc = audio.createOscillator();

	gain.connect(audio.destination);
	gain.gain.setValueAtTime(0, audio.currentTime);
	gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
	gain.gain.linearRampToValueAtTime(0, audio.currentTime + decay / 1000);

	osc.frequency.value = freq;
	osc.type = "square";
	osc.connect(gain);
	osc.start(0);

	setTimeout(function() {
		osc.stop(0);
		osc.disconnect(gain);
		gain.disconnect(audio.destination);
	}, decay)
}

function play() {
	var note = song.charAt(position), freq = scale[note];
	position += 1;
	if (position >= song.length) {
		position = 0;
	}
	if (freq) {
		createOscillator(freq);
	}
}
