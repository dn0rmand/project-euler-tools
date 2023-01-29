module.exports = async function (problem, text) {
  console.log("Problem " + problem + ": " + text);

  const SlackWebhook = require("slack-webhook");
  const url = process.env.ANNOUNCE_SECRET_URL;
  const slack = new SlackWebhook(url);

  await slack.send({
    username: "Problem " + problem,
    text: text,
    icon_emoji: ":loudspeaker:",
  });
};
