/**
 * This example is using the Authorization Code flow.
 *
 * In root directory run
 *
 *     npm install express
 *
 * then run with the followinng command. If you don't have a client_id and client_secret yet,
 * create an application on Create an application here: https://developer.spotify.com/my-applications to get them.
 * Make sure you whitelist the correct redirectUri in line 26.
 *
 *     node access-token-server.js "<Client ID>" "<Client Secret>"
 *
 *  and visit <http://localhost:8888/login> in your Browser.
 */
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
var querystring = require('querystring')
const fs = require('fs')
var favicon = require('serve-favicon')
var path = require('path')

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

const spotifyApi = new SpotifyWebApi({
  redirectUri: 'http://localhost:3000/genre-check',
  clientId: "5460a4a49c7e4d3d97a3eea317f5219b",
  clientSecret: "0d70588b54c9494eb2c4a51031a613ce"
});

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs')

app.use(favicon(path.join(__dirname, 'public', 'logo.ico')))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/home.html")
})

app.get('/login', (req, res) => {

  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  function generateString(length) {
      let result = ' ';
      const charactersLength = characters.length;
      for ( let i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
  
      return result;
  }

  var state = generateString(16);
  var scope = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: "5460a4a49c7e4d3d97a3eea317f5219b",
      scope: scopes,
      redirect_uri: 'http://localhost:3000/genre-check',
      state: state
    }));
});

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  function getAccessToken() {
  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      fs.writeFile('Output.txt', access_token, (err) => {
        // In case of a error throw err.
        if (err) throw err;
      })

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send('Success! You can now close the window.');

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];
        module.exports = access_token
        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
      }, expires_in / 2 * 1000);

      return access_token;

    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
  }

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  } else {
    getAccessToken()
  }

});

app.get('/genre-check', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

    ( async () => {
      spotifyApi
      .authorizationCodeGrant(code)
      .then(async data => {
        const access_token =  data.body['access_token'];
        const refresh_token =  data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  
        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);

        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
          module.exports = access_token
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
        
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
      });

  const me = await spotifyApi.getMe();
  console.log(me.body);
  getUserPlaylists(me.body.id)
  })().catch(e => {
    console.error(e);
  });

  async function getUserPlaylists(userName) {
      const data = await spotifyApi.getUserPlaylists(userName)
      const final = []
      console.log("--------------------------------------------------")
      console.log("Process has started!")
      // for (let playlist of data.body.items){
          console.log(playlist.name + " " + playlist.id)
          let tracks = await getPlaylistTracks(playlist.id, playlist.name)
          let ids = await getPlaylistArtists(playlist.id, playlist.name)
          let genres = await getGenreInfo(ids)
          const time = new Date()
          console.log(time.toTimeString())
          var plname  = playlist.name
          final.push({"plname" : plname,
                      "genres" : genres})
      // }
      res.render('genrecheck',{payload:final})
      console.log("Process has ended")
  }

  async function getPlaylistTracks(playlistId, playlistName) {

      const data = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: 1,
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
              genres.push(genre)
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
    
})

app.listen(3000, () =>
  console.log(
    `Server is listening on port 3000.`
  )
);
