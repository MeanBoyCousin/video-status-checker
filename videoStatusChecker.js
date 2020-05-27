const removeNulls = require('./helpers/removeNulls')
const toThreeDecimals = require('./helpers/toThreeDecimals')
const check = require('./helpers/check')

const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')
const { performance } = require('perf_hooks')
const fs = require('fs')

const checkVideoStatus = async dbPath => {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })

    const start = {
        time: 0,
        id: 865000
    }

    const releases = await db.all(`SELECT id, videos FROM releases WHERE id > ${start.id};`)

    for (const release of releases) {
        const videos = removeNulls(JSON.parse(release.videos))

        const id = release.id

        if (id % 1000 === 0) {
            const completed = id - start.id
            const timePer = toThreeDecimals(performance.now() / completed)
            console.log(`Checking release ${id}... (${timePer}ms)`)
        }

        try {
            const checkedVideos = await Promise.all(
                videos.map(async video => {
                    const status = await check(video.src.slice(32))
                    if (status === 200) {
                        return video
                    } else {
                        return {}
                    }
                })
            ).then(videos => {
                return videos.filter(video => video.src !== undefined)
            })

            if (videos.length > checkedVideos.length && checkedVideos.length > 0) {
                await db.run(`UPDATE releases SET videos = '${JSON.stringify(checkedVideos)}' WHERE id = '${id}'`)
            } else if (checkedVideos.length === 0) {
                await db.run(`DELETE FROM releases WHERE id = '${id}'`)
            }
        } catch (error) {
            fs.appendFileSync('./error-ids.txt', `error - ${id}\n`, 'utf8')
        }
    }

    await db.close()
}

checkVideoStatus('./rhythm-roulette.db')
