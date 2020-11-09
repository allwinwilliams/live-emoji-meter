const SNAPSHOT_URL = "https://api.emojitracker.com";
const STREAM_URL = "https://stream.emojitracker.com";

// const RECENT_URL = "/v1/details/:id";

var total = 0;
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
              $("#canvas").append(`<emoji id="${emoji_store[k].id}">${emoji_store[k].char}</emoji>`);
            }
            var font_size = parseInt($(`#${emoji_store[k].id}`).css("font-size"));
            font_size = (font_size + v) + "px";
            $(`#${emoji_store[k].id}`).css({'font-size':font_size});
            emoji_store[k].count += v;
            emoji_store[k].score += v;
            total += v;
            $("#total-count").text(total);
        }
    }
  })
  .catch(err => console.log(err));


$('emoji').hover((event) => {
  console.log("HOVER");
  let id = $(event.target).attr('id');
  fetch(`${SNAPSHOT_URL}/v1/details/${id}`)
    .then(response => response.json())
    .then(data => {
      $("#current-emoji-details").show();
      $("#current-emoji-details #emoji").text(`Emoji: ${data.char}`);
      $("#current-emoji-details #name").text(`Name: ${data.name}`);
      $("#current-emoji-details #count").text(`Count: ${emoji_store[id].count}`);
      $("#current-emoji-details #total-count").text(`Total count: ${data.score}`);
      $("#current-emoji-details #recent-tweets").html(
        _.take(data.recent_tweets, 3)
        .map(tweet => `<li>${tweet.screen_name} - @${tweet.screen_name} - ${tweet.text}</li>`)
      );
    });
});

$('emoji').mouseout(() => {
  console.log("MOUSE OUT");
  $("#current-emoji-details").hide();
});
