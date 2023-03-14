import mineflayer from 'mineflayer'
import mcData from 'minecraft-data'
import { Item } from 'prismarine-item'



declare module 'mineflayer' {
    interface Bot {
        registry: mcData.IndexedData
        mailing: {
            mail: (username: string,message: string, items: string[]) => void
        }
    }

    interface BotEvents {
        mailing_error: (error: Error) => void
    }
}


export function plugin(bot: mineflayer.Bot){
    // @ts-ignore
    bot.mailing={}

    bot.mailing.mail = (username: string, message: string, items: string[]) => {
        if (bot.currentWindow) return
        bot.chat(`/mail ${username} ${message}`)

        bot.once('windowOpen', async ( window ) => {
            if (!window.title.startsWith('{"text":"放入送给')) {
                bot.emit('mailing_error', new Error("Not Mail GUI"))
                // @ts-ignore
                window.close()
                return
            }


            var i = 0
            window.items().filter((item: Item) => items.includes(item.name)).forEach( async ( item: Item ) => {
                bot.moveSlotItem(item.slot, i)
                bot.waitForTicks(1)
                i+=1
            })
            // @ts-ignore
            window.close()
        })
    }
}