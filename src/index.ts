import mineflayer from 'mineflayer'
import mcData from 'minecraft-data'
import { Item } from 'prismarine-item'

interface Options{
    items: string[]
}


declare module 'mineflayer' {
    interface Bot {
        data: mcData.IndexedData
        mailing: {
            mail: (username: string,message: string, items: string[]) => void
            options: Options
        }
    }

    interface BotEvents {
        mailing_error: (error: Error) => void
    }
}


export function plugin(bot: mineflayer.Bot){
    bot.data = mcData(bot.version)
    // @ts-ignore
    bot.mailing={}
    // @ts-ignore
    bot.mailing.options={}
    bot.mailing.options.items = []
    bot.mailing.mail = (username: string, message: string, items: string[]) => {
        bot.chat(`/mail ${username} ${message}`)
        bot.mailing.options.items = items
        
    }
    bot.on('windowOpen', async ( window ) => {
        if (!window.title.startsWith('{"text":"放入送给')) return

        let items = (bot.inventory.items().filter((item) => {
            return bot.mailing.options.items.includes(item.name)
        }).map((item) => {
            return item.type
        })).filter((v,i,a)=>a.indexOf(v)==i)

        for (let item_id of items){
            try {
                // @ts-ignore
                await window.deposit(item_id, null, 3456, null)
            } catch {

            }
        }
        await bot.waitForTicks(1)
        // @ts-ignore
        await bot.currentWindow.close()
    })
}