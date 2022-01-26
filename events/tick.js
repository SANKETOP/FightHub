const {
    Client,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message,
    TextChannel,
} = require('discord.js')
const giveawayModel = require('../database/models/giveaway')
const timerModel = require('../database/models/timer')
const voteModel = require('../database/models/user')
const ms = require('pretty-ms')
let i = 0
let presenceCounter1 = 0
let presenceCounter2 = 0
let gawCounter1 = 0
let randomColorCounter = 0
let timerCounter = 0
let voteReminderCounter = 0
module.exports = {
    name: 'tick',
    once: false,
    /**
     * @param {Client} client
     */
    async execute(client) {
        // Incrementing everything
        voteReminderCounter++
        // Incrementing everything

        // Random Color
        if (randomColorCounter == 300) {
            randomColorCounter = 0

            const random_hex_color_code = () => {
                // https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-11.php
                let n = (Math.random() * 0xfffff * 1000000).toString(16)
                return '#' + n.slice(0, 6)
            }

            client.guilds.cache
                .get('817734579246071849')
                .roles.cache.get('916045576695590952')
                .setColor(random_hex_color_code())
        }
        // Random Color

        if (voteReminderCounter == 30) {
            voteReminderCounter = 0
            let query = await voteModel.find({})
            query = query.filter(
                (val) =>
                    val.fighthub &&
                    val.fighthub.voting.enabled &&
                    val.fighthub.voting.hasVoted &&
                    val.fighthub.voting.lastVoted < new Date().getTime()
            )
            if (!query || !query.length) {
            } else {
                for (const q of query) {
                    const user = client.users.cache.get(q.userId) || null
                    if (!user) {
                        q.fighthub.voting.hasVoted = false
                        q.save()
                    } else {
                        try {
                            ;(await user.createDM()).send({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle('Vote Reminder')
                                        .setColor('GREEN')
                                        .setTimestamp()
                                        .setDescription(
                                            `You can vote for **[FightHub](https://discord.gg/fight)** now!\nClick **[here](https://top.gg/servers/824294231447044197/vote)** to vote! Last vote was <t:${(
                                                q.fighthub.voting.lastVoted /
                                                1000
                                            ).toFixed(
                                                0
                                            )}:R>\n\nOnce you vote, you will be reminded again after 12 hours. Thanks for your support! You can toggle vote reminders by running \`fh voterm\``
                                        )
                                        .setThumbnail(
                                            client.db.fighthub.iconURL()
                                        ),
                                ],
                            })
                        } catch (e) {
                            q.fighthub.voting.enabled = false
                        } finally {
                            client.channels.cache
                                .get('921645520471085066')
                                .send(
                                    `${user.tag} was **reminded** to vote again.`
                                )
                            q.fighthub.voting.hasVoted = false
                            q.save()
                        }
                    }
                }
            }
        }

        setTimeout(() => {
            client.emit('tick')
        }, 1000)
    },
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
