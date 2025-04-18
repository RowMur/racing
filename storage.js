const TRACK_KEY = "track";

class Storage {
  saveTrack(track) {
    localStorage.setItem(TRACK_KEY, JSON.stringify(track));
  }

  getTrack() {
    const track = localStorage.getItem(TRACK_KEY);
    return track ? JSON.parse(track) : null;
  }
}
