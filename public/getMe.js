import SpotifyWebApi from 'https://cdn.jsdelivr.net/npm/spotify-web-api-js@1.5.2/+esm';
import access_token from '..';

/**
 * Get the credentials from Spotify's Dashboard page.
 * https://developer.spotify.com/dashboard/applications
 */
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  function getAccessToken() {
  SpotifyWebApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      SpotifyWebApi.setAccessToken(access_token);
      SpotifyWebApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);
      
      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );

      setInterval(async () => {
        const data = await SpotifyWebApi.refreshAccessToken();
        const access_token = data.body['access_token'];
        module.exports = access_token
        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        SpotifyWebApi.setAccessToken(access_token);
      }, expires_in / 2 * 1000);
      return access_token
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
  }

//const main = document.getElementById("genres")

SpotifyWebApi.setAccessToken(getAccessToken());

(async () => {
  const me = await spotifyApi.getMe();
  console.log(me.body);
  getUserPlaylists(me.body.id)
})().catch(e => {
  console.error(e);
});

async function getUserPlaylists(userName) {
    const data = await spotifyApi.getUserPlaylists(userName)

    console.log("--------------------------------------------------")
    let playlists = []

    for (let playlist of data.body.items){
        console.log(playlist.name + " " + playlist.id + "\n")

        let tracks = await getPlaylistTracks(playlist.id, playlist.name)
        let ids = await getPlaylistArtists(playlist.id, playlist.name)
        let genres = await getGenreInfo(ids)

        console.log(genres)

    }

}

async function getPlaylistTracks(playlistId, playlistName) {

    const data = await spotifyApi.getPlaylistTracks(playlistId, {
      offset: 1,
      limit: 100,
    })
  
    // console.log('The playlist contains these tracks', data.body);
    // console.log('The playlist contains these tracks: ', data.body.items[0].track);
    // console.log("'" + playlistName + "'" + ' contains these tracks:');
    let tracks = [];
    let genres = [];
  
    for (let track_obj of data.body.items) {
      const track = track_obj.track
      let trackDesc = track.name 
      tracks.push(trackDesc)
    }

    for(let track of tracks){
        const genre = track.genre
        genres.push(genre)
    }
    
    //console.log("---------------+++++++++++++++++++++++++")
    return tracks;
  }

  async function getPlaylistArtists(playlistId, playlistName) {

    const data = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
        limit: 100,
    })
  
    // console.log('The playlist contains these tracks', data.body);
    // console.log('The playlist contains these tracks: ', data.body.items[0].track);
    // console.log("'" + playlistName + "'" + ' contains these tracks:');
    let ids = [];
  
    for (let track_obj of data.body.items) {
        const track = track_obj.track
        ids.push(track.artists[0].id)
    }
     
    return ids; 
}

async function getGenreInfo(artistIds){
    let data = await spotifyApi.getArtists(artistIds.slice(0, 50))

    let genres = []

    for(let i=0; i<data.body.artists.length; i++){
        let temp = data.body.artists[i].genres
        for(let genre of temp){
            genres.push(genre.toString())
        }
    }
    
    const count = {};

    for (const element of genres) {
        if (count[element]) {
            count[element] += 1;
        } else if (element == 'undefined') {
            count['undefined'] += 1;
        } else {
            count[element] = 1;
        }
    }
    
    return count
}