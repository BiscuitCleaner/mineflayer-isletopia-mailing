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
    // @ts-ignore
    bot.mailing.options={}
    bot.mailing.options.items = []
    bot.mailing.mail = (username: string, message: string, items: string[]) => {
        if (bot.currentWindow) return
        bot.chat(`/mail ${username} ${message}`)
        bot.mailing.options.items = items
        
    }
    bot.once('windowOpen', async ( window ) => {
        if (!window.title.startsWith('{"text":"放入送给')) return

        let items = window.items().filter(item=>bot.mailing.options.items.includes(item.name) && item.slot > 8)

        var i = 0
        for (var item of items){
            bot.moveSlotItem(item.slot, i)
            i+=1
            if (i>=8) break
        }
        // @ts-ignore
        window.close()
    })
}