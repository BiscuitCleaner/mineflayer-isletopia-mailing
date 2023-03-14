import mineflayer from 'mineflayer'
import mcData from 'minecraft-data'
import { Item } from 'prismarine-item'

interface Options{
    items: string[]
}


declare module 'mineflayer' {
    interface Bot {
        registry: mcData.IndexedData
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
    // @ts-ignore
    bot.mailing={}
    bot.mailing.options.items = []
    bot.mailing.mail = (username: string, message: string, items: string[]) => {
        if (bot.currentWindow) return
        bot.chat(`/mail ${username} ${message}`)
        bot.mailing.options.items = items
        
    }
    bot.once('windowOpen', async ( window ) => {
        if (!window.title.startsWith('{"text":"放入送给')) {
            bot.emit('mailing_error', new Error("Not Mail GUI"))
            // @ts-ignore
            window.close()
            return
        }

        let item = bot.inventory.items().filter(item=>bot.mailing.options.items.includes(item.name))[0]

        if (!item){
            return
        }
        bot.transfer({
            window: window,
            itemType: item.type,
            metadata: item.metadata,
            count: 576,
            sourceStart: 9,
            sourceEnd: 26,
            destStart: 0,
            destEnd: 8,
        })
        // @ts-ignore
        window.close()
    })
}