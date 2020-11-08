const SNAPSHOT_URL = "https://api.emojitracker.com";
const STREAM_URL = "https://stream.emojitracker.com";

// const RECENT_URL = "/v1/details/:id";
var canvas = "";
let emoji_store = {};

fetch(`${SNAPSHOT_URL}/v1/status`)
  .then(response => {
    console.log(`${response.status} - API is working fine...`);
  });

fetch(`${SNAPSHOT_URL}/v1/rankings`)
  .then(response => response.json())
  .then(data => _.keyBy(data, 'id'))
  .then(data => _.mapValues(data, o => {
    o.count = 0;
    return o;
  }))
  .then(object => {
    emoji_store = object;
    console.log(emoji_store);
    //  = emoji_store.map(item =>`${item.char} - ${item.id}`);
    let evsource = new EventSource(`${STREAM_URL}/subscribe/eps`);
    evsource.onmessage = function(event) {
        const updates = JSON.parse(event.data);
        for (const [k, v] of Object.entries(updates)) {
            // console.log(`Emoji with id ${k} got score increase of ${v}`);
            if(emoji_store[k].count == 0){
              $("#canvas").prepend(`<emoji id="${emoji_store[k].id}">${emoji_store[k].char}</emoji>`);
            }
            var fontSize = parseInt($(`#${emoji_store[k].id}`).css("font-size"));
            fontSize = fontSize + v + "px";
            $(`#${emoji_store[k].id}`).css({'font-size':fontSize});
            emoji_store[k].count += v;
        }
    }
  })
  .catch(err => console.log(err));
