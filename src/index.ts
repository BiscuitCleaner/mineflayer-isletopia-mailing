import mineflayer from 'mineflayer'
import mcData from 'minecraft-data'
import { Item } from 'prismarine-item'



declare module 'mineflayer' {
    interface Bot {
        registry: mcData.IndexedData
        mailing: {
            mail: (username: string,message: string, items: Item[]) => void
        }
    }

    interface BotEvents {
        mailing_error: (error: Error) => void
    }
}


export function plugin(bot: mineflayer.Bot){
    // @ts-ignore
    bot.mailing={}
    bot.mailing.mail = async (username: string, message: string, items: Item[]) => {
        if (bot.currentWindow) return
        if (items.length > 9) {
            bot.emit('mailing_error', new Error("Too many items, maximum is 9"))
            return
        }
        bot.chat(`/mail ${username} ${message}`)

        bot.once('windowOpen', async ( window ) => {
            if (!window.title.startsWith('{"text":"放入送给')) {
                bot.emit('mailing_error', new Error("Not Mail GUI"))
                // @ts-ignore
                window.close()
                return
            }
            if (items.length > 9) {
                bot.emit('mailing_error', new Error("Too many items, maximum is 9"))
                // @ts-ignore
                window.close()
                return
            }
            var i = 0
            items.forEach( async ( item: Item ) => {
                bot.moveSlotItem(item.slot, i)
                i+=1
            })
            // @ts-ignore
            window.close()
        })
    }
}