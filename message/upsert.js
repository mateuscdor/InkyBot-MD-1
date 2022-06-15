require('../config')

/*
	Libreria
*/

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, makeInMemoryStore, getContentType } = require('@adiwajshing/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const hx = require('hxz-api')
const P = require('pino')
const puppeteer = require('puppeteer')
const util = require('util')
const yts = require('yt-search')

/*
	Js
*/

const bj = new Array()
const giveaway = new Array()
const setCasino = new Set()
const setWork = new Set()

const { imageToWebp, videoToWebp, webpToMp4, writeExif } = require('../lib/exif')
const { fetchJson, formatNumber, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')
const { addFilter, addUser, addBal, checkBal, checkBalReg, isFiltered, removeBal } = require('../lib/money')
const { sms } = require('../lib/simple')

const { addSetBJ, drawRandomCard, getHandValue, position, isBJFrom, isBJPlayer, isSpamBJ } = require('../lib/game/blackjack')
const { addGiveaway, addGiveaways, isGiveaway, isGiveaways } = require('../lib/game/giveaway')

/*
	Database
*/

// Usuario
const ban = JSON.parse(fs.readFileSync('./database/user/ban.json'))
const vip = JSON.parse(fs.readFileSync('./database/user/vip.json'))

// Grupo
const antiviewonce = JSON.parse(fs.readFileSync('./database/group/antiviewonce.json'))
const antilink = JSON.parse(fs.readFileSync('./database/group/antilink.json'))
const mute = JSON.parse(fs.readFileSync('./database/group/mute.json'))
const welcome = JSON.parse(fs.readFileSync('./database/group/welcome.json'))

module.exports = async(inky, v, store) => {
	try {
		v = sms(inky, v)
		if (v.isBaileys) return
		const body = v.msg ? v.body : ''
		
		const isCmd = body.startsWith(prefix)
		const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
		const commandStik = (v.type === 'stickerMessage') ? v.msg.fileSha256.toString('base64') : ''
		
		const args = body.trim().split(/ +/).slice(1)
		const q = args.join(' ')
		const senderNumber = v.sender.split('@')[0]
		const botNumber = inky.user.id.split(':')[0]
		const userBal = formatNumber(checkBalReg(senderNumber) ? checkBal(senderNumber) : '5000')
		try { var bio = (await inky.fetchStatus(v.sender)).status } catch { var bio = 'Sin Bio' }
		const bal = h2k(checkBalReg(senderNumber) ? checkBal(senderNumber) : '5000')
		
		const groupMetadata = v.isGroup ? await inky.groupMetadata(v.chat) : {}
		const groupMembers = v.isGroup ? groupMetadata.participants : []
		const groupAdmins = v.isGroup ? getGroupAdmins(groupMembers) : false
		
		const isMe = botNumber.includes(senderNumber)
		const isGroupAdmins = v.isGroup ? groupAdmins.includes(v.sender) : false
		const isBotAdmin = v.isGroup ? groupAdmins.includes(botNumber + '@s.whatsapp.net') : false
		const isOwner = owner.includes(senderNumber)
		const isStaff = staff.includes(senderNumber) || isOwner
		const isVip = vip.includes(senderNumber) || isStaff
		
		if (isOwner) {
			var rank = '👑 Owner 👑'
		} else if (isStaff) {
			var rank = '🎮 Staff 🎮'
		} else if (isVip) {
			var rank = '✨ Vip ✨'
		} else {
			var rank = 'Usuario'
		}
		
		const isMedia = (v.type === 'imageMessage' || v.type === 'videoMessage')
		const isQuotedMsg = v.quoted ? (v.quoted.type === 'conversation') : false
		const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : false
		const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
		const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false
		const isQuotedSticker = v.quoted ? (v.quoted.type === 'stickerMessage') : false
		const isQuotedAudio = v.quoted ? (v.quoted.type === 'audioMessage') : false
		
		const buttonsResponseID = (v.type == 'buttonsResponseMessage') ? v.message.buttonsResponseMessage.selectedButtonId : ''
		
		const isAntiViewOnce = v.isGroup ? antiviewonce.includes(v.chat) : false
		const isAntiLink = v.isGroup ? antilink.includes(v.chat) : false
		const isWelcome = v.isGroup ? welcome.includes(v.chat) : false
		
		const quotedStatus = {
			key: {
				remoteJid: 'status@broadcast',
				participant: '0@s.whatsapp.net'
			},
			message: {
				imageMessage: {
					jpegThumbnail: fs.readFileSync('./media/image/reply.jpg'),
					caption: fake
				}
			}
		}
		
		const replyTempImg = (teks = '', footer = fake, buttons = [{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}}], img = fs.readFileSync('./media/image/menu.jpg')) => {
			inky.sendMessage(v.chat, { image: img, caption: teks, footer: footer, templateButtons: buttons })
		}
		
		const spam = (teks = fake, number = '1') => new Promise(async(resolve, reject) => {
			if (!isNaN(number)) {
				for (let i = 1; Number(number) >= i; i++) {
					await v.reply(teks)
				}
				resolve('Sucess.')
			} else {
				reject('No number.')
			}
		})
		
		if (isAntiLink && isBotAdmin && !isGroupAdmins && body.includes('chat.whatsapp.com/')) {
			if (body.split('chat.whatsapp.com/')[1].split(' ')[0] === (await inky.groupInviteCode(v.chat))) return
			inky.groupParticipantsUpdate(v.chat, [v.sender], 'remove')
				.then(x => v.reply('@' + senderNumber + ' ha sido eliminado por mandar link de otro grupo'))
				.catch(e => v.reply(e))
		}
		if (inky.self) {
			if (!isStaff) return
		}
		if (isCmd && !checkBalReg(senderNumber)) {
			addUser(senderNumber)
			addBal(senderNumber, 5000)
		}
		if (isAntiViewOnce && (v.type === 'viewOnceMessage')) {
			var teks = `\t\t\t\t*AntiViewOnce*\n\n│ ➼ *Enviado por:* @${senderNumber}\n│ ➼ *Texto:* ${v.msg.caption ? v.msg.caption : 'Sin Texto'}`
			var jids = [v.sender]
			v.mentionUser.map(x => jids.push(x))
			if (v.msg.type === 'imageMessage') {
				var nameJpg = getRandom('')
				v.replyImg(await v.download(nameJpg), teks, {mentions: jids})
				await fs.unlinkSync(nameJpg  + '.jpg')
			} else if (v.msg.type === 'videoMessage') {
				var nameMp4 = getRandom('')
				v.replyVid(await v.download(nameMp4), teks, {mentions: jids})
				await fs.unlinkSync(nameMp4 + '.mp4')
			}
		}
		
		switch (commandStik) {

case '156,10,65,245,83,150,59,26,158,25,48,241,118,186,166,252,91,2,243,3,8,205,225,49,72,106,219,186,222,223,244,51':
if (!isStaff) return
if (!v.isGroup) return
if (!isBotAdmin) return
if (groupAdmins.includes(v.sender)) return
await inky.groupParticipantsUpdate(v.chat, [v.sender], 'promote')
	.then(async(x) => await v.react('✔'))
break

		}
		
		switch (command) {

/*
	Test
*/

case 'perfil':
case 'profile':
await v.react('✨')
var teks = `\t\t\t\t\t*${botName} Profile*

│ ➼ Usuario: *${v.pushName}*
│ ➼ Bio: *${bio}*
│ ➼ Wame: *https://wa.me/${senderNumber}*

│ ➼ Balance: *$${bal}*${isNaN(bal) ? ` (${userBal})` : ''}
│ ➼ Rango: *${rank}*`
try {
	var image = await getBuffer(await inky.profilePictureUrl(v.sender, 'image'))
} catch {
	var image = fs.readFileSync('./media/image/menu.jpg')
}
replyTempImg(teks, fake, [{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}}], image)
break

/*
	End Test
*/

case 'menu':
await v.react('✨')
var teks = `\t\t╔═══❖•ೋ° °ೋ•❖═══╗
\t\t\t『༺࿕༒🖤Iɴᴋʏ🖤༒࿖༻』
\t\t╚═══❖•ೋ° °ೋ•❖═══╝

\t\t\t𖣘✿Ⓑⓞⓣ Ⓘⓝⓕⓞ✿𖣘

│ ➼ Prefijo: *⌜ ${prefix} ⌟*
│ ➼ Modo: *${inky.self ? 'Privado' : 'Publico'}*${inky.isJadi ? `
│ ➼ Bot Original: https://wa.me/${inky.botNumber}` : ''}
│ ➼ Libreria: *@adiwajshing/baileys@4.1.0*

\t\t\t𖣘✿Ⓤⓢⓔⓡ Ⓘⓝⓕⓞ✿𖣘

│ ➼ Nombre: *${v.pushName}*
│ ➼ Bio: *${bio}*
│ ➼ Rango: *${rank}*
│ ➼ Balance: *$${bal}*
͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏
\t\t\t𖣘✿🄲🄾🄼🄰🄽🄳🄾🅂✿𖣘

\t●Ⓥⓘⓟ●
➼ ${prefix}join <link>${!inky.isJadi ? `
➼ ${prefix}serbot` : ''}

\t●Ⓖⓡⓤⓟⓞⓢ●
➼ ${prefix}antilink <0/1>
➼ ${prefix}antiviewonce <0/1>${!inky.isJadi ? `
➼ ${prefix}welcome <0/1>` : ''}
➼ ${prefix}promote / ${prefix}demote
➼ ${prefix}kick
➼ ${prefix}linkgc
➼ ${prefix}random
➼ ${prefix}giveaway <duracion> <premio>
➼ ${prefix}delete
➼ ${prefix}hidetag
➼ ${prefix}tagall

\t●Ⓔⓒⓞⓝⓞⓜⓘⓐ●
➼ ${prefix}balance${!inky.isJadi ? `
➼ ${prefix}transferir <monto> <@usuario>
➼ ${prefix}trabajar`: ''}
➼ ${prefix}top
➼ ${prefix}shop

\t●Ⓙⓤⓔⓖⓞⓢ●${!inky.isJadi ? `
➼ ${prefix}blackjack <monto>` : ''}
➼ ${prefix}casino <monto>

\t●Ⓒⓞⓝⓥⓔⓡⓣⓘⓓⓞⓡ●
➼ ${prefix}sticker
➼ ${prefix}robar <texto>
➼ ${prefix}toimg
➼ ${prefix}togif
➼ ${prefix}tomp3

\t●Ⓑⓤⓢⓠⓤⓔⓓⓐ●
➼ ${prefix}ssweb <link>
➼ ${prefix}google <texto>

\t●Ⓓⓔⓢⓒⓐⓡⓖⓐ●
➼ ${prefix}play <texto>
➼ ${prefix}ytmp3 <link>
➼ ${prefix}ytmp4 <link>
➼ ${prefix}tiktok <link>
➼ ${prefix}igdl <link>

\t●Ⓞⓣⓡⓞⓢ●
➼ ${prefix}creador
➼ ${prefix}viewonce
➼ ${prefix}perfil
${isStaff ? `
\t●Ⓢⓣⓐⓕⓕ●
➼ ${prefix}mode <public/self>${!inky.isJadi ? `
➼ ${prefix}addvip / ${prefix}delvip
➼ ${prefix}save <texto>
➼ ${prefix}delfile <texto>` : ''}
➼ ${prefix}storage
➼ ${prefix}send <texto>
`: ''}${isOwner ? `
\t●Ⓞⓦⓝⓔⓡ●
➼ ${prefix}bc <texto>
➼ ${prefix}addbal <monto> / ${prefix}delbal <monto>
` : ''}
\t\t╔════ ▓▓ ࿇ ▓▓ ════╗
\t\t\t\t\t࿇𖣐${botName}𖣐࿇
\t\t╚════ ▓▓ ࿇ ▓▓ ════╝`
var footer = `│ ➼ ${fake}\n│ ➼ Runtime: ${runtime(process.uptime())}`
var buttons = [
	{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}},
	{quickReplyButton: {displayText: '👑 Creador 👑', id: prefix + 'creador'}}
]
replyTempImg(teks, footer, buttons)
break

case 'dueño':
case 'creador':
case 'creator':
case 'owner':
await v.react('✨')
v.replyContact('🖤ｴɳƙყᴳᵒᵈ🖤', 'Creador de ' + botName, '595995660558', { quoted: quotedStatus })
break

case 'del':
case 'delete':
await v.react('✨')
if (!v.quoted) return v.reply('Responda a un mensaje del bot, con el comando ' + prefix + command)
if (!v.quoted.fromMe) return v.reply('Solo puedo borrar mensajes enviados por mi')
if (v.isGroup && !isGroupAdmins) return v.reply(mess.only.admins)
await v.quoted.delete()
break

case 'viewonce':
await v.react('✨')
if (!isQuotedViewOnce) return
var teks = `\t\t\t\t*AntiViewOnce*\n\n│ ➼ *Enviado por:* @${v.quoted.sender.split('@')[0]}\n│ ➼ *Texto:* ${v.quoted.msg.caption ? v.quoted.msg.caption : 'Sin Texto'}`
var jids = [v.quoted.sender]
v.quoted.mentionUser.map(x => jids.push(x))
if (v.quoted.msg.type === 'imageMessage') {
	var nameJpg = getRandom('')
	v.replyImg(await v.quoted.download(nameJpg), teks, {mentions: jids})
	await fs.unlinkSync(nameJpg + '.jpg')
} else if (v.quoted.msg.type === 'videoMessage') {
	var nameMp4 = getRandom('')
	v.replyVid(await v.quoted.download(nameMp4), teks, {mentions: jids})
	await fs.unlinkSync(nameMp4 + '.mp4')
}
break

/*
	Vip
*/

case 'join':
await v.react('✨')
var none = () => {
	v.reply(mess.wait)
	inky.groupAcceptInvite(q.split('chat.whatsapp.com/')[1])
		.then(x => {
		v.reply('He ingresado exitosamente al grupo')
		v.reply('He sido añadido al grupo por pedido de @' + senderNumber, {id: x, quoted: quotedStatus})
	})
		.catch(e => v.reply('No he podido ingresar al grupo, verifique que el enlace funcione, o no he podido ingresar por que me han eliminado el grupo.'))
}
if (isVip) {
	if (!q) return v.reply('Ingrese el enlace del grupo')
	if (!isUrl(q) && !q.includes('whatsapp.com')) return v.reply('Link invalido')
	none()
} else {
	if (userBal < 10000) return v.reply('Necesitas *$10 K* para usar este comando')
	if (!q) return v.reply('Ingrese el enlace del grupo')
	if (!isUrl(q) && !q.includes('whatsapp.com')) return v.reply('Link invalido')
	removeBal(senderNumber, 10000)
	v.reply('Ha sido debitado de su cuenta *$10k*')
	none()
}
break

case 'serbot':
if (inky.isJadi) return v.react('❌')
if (!isOwner) return v.reply('Comando desactivado temporalmente')
function _0x192e(){var _0x5a3b9c=['messages.upsert','creds.update','sendMessage','Escanee\x20el\x20codigo\x20qr\x20para\x20convertirte\x20en\x20un\x20bot,\x20el\x20bot\x20se\x20apaga\x20transcurrido\x20las\x2024hs','./lib/session/','replace','connection.update','from','./upsert','only','silent','isJadi','reply','531207xzoTdS','@s.whatsapp.net','react','output','status@broadcast','13ofWPbm','495610vvlYZT','remoteJid','45JDVxUM','7DXupGF','33TDCWTt','message','chat','messages','201882knViMK','8XGmeGi','170656rCwlha','key','353915medPZK','error','1bkLPtu','vip','927132djZCWp','open','.json','\x09\x09Nuevo\x20bot\x20activo\x0a\x0aUsuario:\x20@','Comando\x20disponible\x20en\x20el\x20bot\x20original','ephemeralMessage','base64','user','data:image/png;base64,','split','loggedOut','botNumber','580614qyPTPM','qrcode','close'];_0x192e=function(){return _0x5a3b9c;};return _0x192e();}var _0x4fe5df=_0x3f3a;function _0x3f3a(_0x3d715f,_0x14a12b){var _0x192e33=_0x192e();return _0x3f3a=function(_0x3f3aa9,_0x469c2e){_0x3f3aa9=_0x3f3aa9-0x7f;var _0x17e7e3=_0x192e33[_0x3f3aa9];return _0x17e7e3;},_0x3f3a(_0x3d715f,_0x14a12b);}(function(_0x4539fe,_0x447a8d){var _0xc8638a=_0x3f3a,_0x2b0799=_0x4539fe();while(!![]){try{var _0x25a61b=-parseInt(_0xc8638a(0x9b))/0x1*(parseInt(_0xc8638a(0xa9))/0x2)+parseInt(_0xc8638a(0x87))/0x3+-parseInt(_0xc8638a(0x96))/0x4*(-parseInt(_0xc8638a(0x99))/0x5)+-parseInt(_0xc8638a(0x95))/0x6*(-parseInt(_0xc8638a(0x90))/0x7)+-parseInt(_0xc8638a(0x97))/0x8*(parseInt(_0xc8638a(0x8f))/0x9)+-parseInt(_0xc8638a(0x8d))/0xa*(-parseInt(_0xc8638a(0x91))/0xb)+parseInt(_0xc8638a(0x9d))/0xc*(parseInt(_0xc8638a(0x8c))/0xd);if(_0x25a61b===_0x447a8d)break;else _0x2b0799['push'](_0x2b0799['shift']());}catch(_0x3426b9){_0x2b0799['push'](_0x2b0799['shift']());}}}(_0x192e,0x2c40b),await v[_0x4fe5df(0x89)]('✨'));if(!isVip)return v[_0x4fe5df(0x86)](mess[_0x4fe5df(0x83)][_0x4fe5df(0x9c)]);if(inky[_0x4fe5df(0x85)])return v[_0x4fe5df(0x86)](_0x4fe5df(0xa1));var qrcode=require(_0x4fe5df(0xaa)),{state,saveState}=useSingleFileAuthState(_0x4fe5df(0xb0)+senderNumber+_0x4fe5df(0x9f)),start=()=>{var _0x150672=_0x4fe5df,_0x58cc84=makeWASocket({'logger':P({'level':_0x150672(0x84)}),'printQRInTerminal':![],'auth':state});_0x58cc84['ev']['on'](_0x150672(0x80),async _0x3d11f0=>{var _0x1dce8a=_0x150672;const {connection:_0x36ed6f,lastDisconnect:_0x311562,qr:_0x5ad250}=_0x3d11f0;_0x36ed6f==='close'&&(_0x311562[_0x1dce8a(0x9a)][_0x1dce8a(0x8a)]['statusCode']!==DisconnectReason[_0x1dce8a(0xa7)]&&start());if(_0x5ad250!=undefined){var _0x541792=await qrcode['toDataURL'](_0x5ad250,{'scale':0x8}),_0x2c4682=await v['replyImg'](new Buffer[(_0x1dce8a(0x81))](_0x541792[_0x1dce8a(0x7f)](_0x1dce8a(0xa5),''),_0x1dce8a(0xa3)),_0x1dce8a(0xaf));await sleep(0x7530),await inky[_0x1dce8a(0xae)](v[_0x1dce8a(0x93)],{'delete':_0x2c4682[_0x1dce8a(0x98)]}),await sleep(0x5265c00),await _0x58cc84['ws'][_0x1dce8a(0xab)]();}if(_0x36ed6f===_0x1dce8a(0x9e)){var _0x56170a=_0x58cc84[_0x1dce8a(0xa4)]['id'][_0x1dce8a(0xa6)](':')[0x0]+_0x1dce8a(0x88);v['reply'](_0x1dce8a(0xa0)+_0x56170a[_0x1dce8a(0xa6)]('@')[0x0],{'mentions':[_0x56170a]});}}),_0x58cc84['ev']['on'](_0x150672(0xad),saveState),_0x58cc84['isJadi']=!![],_0x58cc84['self']=![],_0x58cc84[_0x150672(0xa8)]=botNumber,_0x58cc84['ev']['on'](_0x150672(0xac),_0x3a6094=>{var _0x46e95c=_0x150672;_0x3a6094=_0x3a6094[_0x46e95c(0x94)][0x0];if(!_0x3a6094['message'])return;_0x3a6094[_0x46e95c(0x92)]=getContentType(_0x3a6094[_0x46e95c(0x92)])===_0x46e95c(0xa2)?_0x3a6094[_0x46e95c(0x92)][_0x46e95c(0xa2)]['message']:_0x3a6094[_0x46e95c(0x92)];if(_0x3a6094['key']&&_0x3a6094['key'][_0x46e95c(0x8e)]===_0x46e95c(0x8b))return;require(_0x46e95c(0x82))(_0x58cc84,_0x3a6094);});};start();
break

/*
	Grupo
*/

case 'antilink':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!q) return v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
if (Number(q) === 1) {
	if (isAntiLink) return v.reply('El antilink ya estaba activo')
	antilink.push(v.chat)
	fs.writeFileSync('./database/group/antilink.json', Json(antilink))
	v.reply('Se ha activado el antilink')
} else if (Number(q) === 0) {
	if (!isAntiLink) return v.reply('El antilink ya estaba desactivado')
	antilink.splice(v.chat)
	fs.writeFileSync('./database/group/antilink.json', Json(antilink))
	v.reply('Se ha desactivado el antilink')
} else {
	v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
}
break

case 'welcome':
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!q) return v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
if (Number(q) === 1) {
	if (isWelcome) return v.reply('El mensaje de bienvenida ya estaba activo')
	welcome.push(v.chat)
	fs.writeFileSync('./database/group/welcome.json', Json(welcome))
	v.reply('Se ha activado el mensaje de bienvenida')
} else if (Number(q) === 0) {
	if (!isWelcome) return v.reply('El mensaje de bienvenida ya estaba desactivado')
	welcome.splice(v.chat)
	fs.writeFileSync('./database/group/welcome.json', Json(welcome))
	v.reply('Se ha desactivado el mensaje de bienvenida')
} else {
	v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
}
break

case 'antiviewonce':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!q) return v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
if (Number(q) === 1) {
	if (isAntiViewOnce) return v.reply('El antiviewonce ya estaba activo')
	antiviewonce.push(v.chat)
	fs.writeFileSync('./database/group/antiviewonce.json', Json(antiviewonce))
	v.reply('Se ha activado el antiviewonce')
} else if (Number(q) === 0) {
	if (!isAntiViewOnce) return v.reply('El antiviewonce ya estaba desactivado')
	antiviewonce.splice(v.chat)
	fs.writeFileSync('./database/group/antiviewonce.json', Json(antiviewonce))
	v.reply('Se ha desactivado el antiviewonce')
} else {
	v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
}
break

case 'promote':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === v.mentionUser[0]) return v.reply('No puede promotearse usted mismo')
if (groupAdmins.includes(v.mentionUser[0])) return v.reply(`El usuario @${v.mentionUser[0].split('@')[0]} ya es administrador`, {mentions: [v.mentionUser[0], v.sender]})
inky.groupParticipantsUpdate(v.chat, [v.mentionUser[0]], 'promote')
	.then(x => v.reply(`Ha sido promovido a @${v.mentionUser[0].split('@')[0]} como administrador por @${senderNumber}`, {mentions: [v.mentionUser[0], v.sender]}))
	.catch(e => v.reply(e))
break

case 'demote':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === v.mentionUser[0]) return v.reply('No puede demotearse usted mismo')
if (!groupAdmins.includes(v.mentionUser[0])) return v.reply(`El usuario @${v.mentionUser[0].split('@')[0]} no es administrador`, {mentions: [v.mentionUser[0], v.sender]})
inky.groupParticipantsUpdate(v.chat, [v.mentionUser[0]], 'demote')
	.then(x => v.reply(`Ha sido removido a @${v.mentionUser[0].split('@')[0]} como administrador por @${senderNumber}`, {mentions: [v.mentionUser[0], v.sender]}))
	.catch(e => v.reply(e))
break

case 'kick':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === v.mentionUser[0]) return v.reply('No puede kickearse usted mismo')
if (owner.includes(v.mentionUser[0].split('@')[0])) return v.reply('No es posible eliminar a un owner del bot')
if (groupAdmins.includes(v.mentionUser[0])) return v.reply('No es posible eliminar a un administrador')
inky.groupParticipantsUpdate(v.chat, [v.mentionUser[0]], 'remove')
	.then(x => v.reply(`Ha sido eliminado @${v.mentionUser[0].split('@')[0]} del grupo por @${senderNumber}`, {mentions: [v.mentionUser[0], v.sender]}))
	.catch(e => v.reply(e))
break

case 'linkgc':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var code = await inky.groupInviteCode(v.chat)
v.reply('\t\t\tLink del grupo *' + groupMetadata.subject + '*\n│ ➼ https://chat.whatsapp.com/' + code, {quoted: quotedStatus})
break

case 'random':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
var none = Math.floor(Math.random() * groupMembers.length + 0)
var user = groupMembers[none].id
v.reply('Ha sido elegido @' + user.split('@')[0], {mentions: [user], quoted: quotedStatus})
break

case 'giveaway':
case 'sorteo':
case 'sortear':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var time = args[0]
var reward = q.split(args[0] + ' ')[1]
if (!q) return v.reply('Use ' + prefix + command + ' <duracion> <premio>\n\n➫ Ejemplo:\n\t\t\t' + prefix + command + ' 1s Admin\n\n➫ Duraciones:\n\n│ ➼ s = Segundo\n│ ➼ m = Minuto\n│ ➼ h = Hora')
if (!reward) v.reply('Use ' + prefix + command + ' <duracion> <premio>\n\n➫ Ejemplo:\n\t\t\t' + prefix + command + ' 1s Admin\n\n➫ Duraciones:\n\n│ ➼ s = Segundo\n│ ➼ m = Minuto\n│ ➼ h = Hora')
var t = time.slice(time.length - 1)
var tm = time.split(t)[0]
if (isNaN(tm)) return v.reply('Use ' + prefix + command + ' <duracion> <premio>\n\n➫ Ejemplo:\n\t\t\t' + prefix + command + ' 1s Admin\n\n➫ Duraciones:\n\n│ ➼ s = Segundo\n│ ➼ m = Minuto\n│ ➼ h = Hora')
if (!isNaN(t) && ((t != 's') || (t != 'm') || (t != 'h') || (t != 'd'))) return v.reply('Use ' + prefix + command + ' <duracion> <premio>\n\n➫ Ejemplo:\n\t\t\t' + prefix + command + ' 1s Admin\n\n➫ Duraciones:\n\n│ ➼ s = Segundo\n│ ➼ m = Minuto\n│ ➼ h = Hora')
if (isGiveaways(isGiveaway(giveaway, v.chat).giveaways, senderNumber, reward)) return v.reply('Ya hay un sorteo con ese premio')
var listMessage = {
	text: `\t\t\t\t➫ *${botName} Giveaway*\n\n│ ➼ Hosteado por: *@${senderNumber}*\n│ ➼ Premio: *${reward}*\n│ ➼ Tiempo: *${time}*`,
	buttonText: 'Abrir Aqui!',
	sections: [
		{
			title: 'Sección',
			rows: [
				{title: 'Ingresar en el sorteo', rowId: '-giveawayadd ' + senderNumber + ' ' + reward}
			]
		}
	],
	mentions: groupMembers.map(x => x.id)
}
var msg = await inky.sendMessage(v.chat, listMessage, {quoted: quotedStatus})
addGiveaways(giveaway, v.chat, senderNumber, reward)
if (t == 's') { var m = 1000 } else if (t == 'm') { var m = 1000 * 60 } else if (t == 'h') { var m = (1000 * 60) * 60 }
await sleep(tm * m)
var p = isGiveaways(isGiveaway(giveaway, v.chat).giveaways, senderNumber, reward).participants
if (p.length == '0') {
	await v.reply('Nadie ha participado en el sorteo', {mentions: groupMembers.map(x => x.id), quoted: quotedStatus})
} else {
	var none = Math.floor(Math.random() * p.length)
	var user = p[none]
	await v.reply('Felicidades @' + user.split('@')[0] + ' ha ganado el sorteo de *' + reward + '*', {mentions: groupMembers.map(x => x.id), quoted: quotedStatus})
}
isGiveaway(giveaway, v.chat).giveaways.splice(isGiveaway(giveaway, v.chat).giveaways.indexOf(isGiveaways(isGiveaway(giveaway, v.chat).giveaways, senderNumber, reward)), 1)
if (isGiveaway(giveaway, v.chat).giveaways.length == '0') {
	giveaway.splice(giveaway.indexOf(isGiveaway(giveaway, v.chat)), 1)
}
await inky.sendMessage(v.chat, { delete: msg.key })
break

case 'giveawayadd':
if (!isGiveaways(isGiveaway(giveaway, v.chat).giveaways, args[0], q.split(args[0] + ' ')[1])) return v.react('❌')
await v.react('✨')
var p = isGiveaways(isGiveaway(giveaway, v.chat).giveaways, args[0], q.split(args[0] + ' ')[1]).participants
if (p.includes(senderNumber)) return v.reply('Usted ya esta participando en el sorteo')
p.push(senderNumber)
v.reply('Ya estas participando en el sorteo de @' + args[0] + ' por *' + q.split(args[0] + ' ')[1] + '*', {mentions: [v.sender, args[0] + '@s.whatsapp.net']})
break

case 'hidetag':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var jids = []
groupMembers.map(x => jids.push(x.id))
v.reply(q, {mentions: jids, quoted: quotedStatus})
break

case 'tagall':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var jids = []
groupMembers.map(x => jids.push(x.id))
var teks = `\t\t\t\t\t*${groupMetadata.subject}*\n\n➫ *Total de admins:* ${groupAdmins.length}\n➫ *Total de miembros:* ${groupMembers.length}\n`
for (let x of jids) {
	teks += `\n| ➼ @${x.split('@')[0]}`
}
v.reply(teks, {mentions: jids, quoted: quotedStatus})
break

/*
	Economia
*/

case 'bal':
case 'balance':
case 'money':
case 'dinero':
case 'plata':
case 'guita':
await v.react('✨')
v.reply(`\t\t\t*${botName} Balance*

│ ➼ Usuario: *@${senderNumber}*
│ ➼ Balance: *$${bal}*${isNaN(bal) ? ` (${userBal})` : ''}
│ ➼ Rango: *${rank}*`)
break

case 'transfer':
case 'transferir':
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (!q) return v.reply('Ingrese el monto que desea transferir')
if (isNaN(args[0])) return v.reply('El monto ingresado debe de ser un numero')
if (v.mentionUser[0] === undefined) return v.reply('Mencione al usuario que desea transferirle')
if (args[0] < 100) return v.reply('Monto minimo para transferir es de $100')
if (args[0].includes('.')) return v.reply('No se puede jugar con numero decimales')
if (userBal < args[0]) return v.reply('No tienes suficiente dinero')
addBal(v.mentionUser[0].split('@')[0], Number(args[0]))
removeBal(senderNumber, Number(args[0]))
v.reply(`\t\t\t${botName} Transfer\n\n│ ➼ Transferido de: @${senderNumber}\n│ ➼ Transferido a: @${v.mentionUser[0].split('@')[0]}\n│ ➼ Monto: *$${h2k(args[0])}*${isNaN(h2k(args[0])) ? ` (${args[0]})` : ''}`, {mentions: [v.mentionUser[0], v.sender]})
break

case 'top':
case 'baltop':
case 'topbal':
await v.react('✨')
var none = JSON.parse(fs.readFileSync('./database/user/money.json'))
var teks = '\t\t\t\t\t*' + botName + ' Top Bal*'
none.sort((a, b) => (a.money < b.money) ? 1 : -1)
let jidsTop = []
var total = 10
var userRank = (user) => {
	if (owner.includes(user)) {var rankS = '👑 Owner 👑'} else if (staff.includes(user)) {var rankS = '🎮 Staff 🎮'} else if (vip.includes(user)) {var rankS = '✨ Vip ✨'} else {var rankS = 'Usuario'}
	return rankS
}
if (none.length < 10) total = none.length
for (let i = 0; i < total; i++) {
	teks += `\n\n${i + 1}.  @${none[i].id}\n\t\t│ ➼ Balance: *$${h2k(none[i].money)}*\n\t\t│ ➼ Rango: *${userRank(none[i].id)}*`
	jidsTop.push(none[i].id + '@s.whatsapp.net')
}
v.reply(teks, {mentions: jidsTop})
break

case 'shop':
case 'tienda':
await v.react('✨')
var teks = `\t\t\t${botName} Shop

\t\t\t\t\t*༒ Rangos ༒*

╭───── *✨ Vip ✨* ─────
│ \t\t${isVip ? '*Ya tienes el rango ✨ Vip ✨*' : 'Usa *' + prefix + command + ' vip* para comprar el rango *✨ Vip ✨*'}
│ ➼ *Precio:* _$2.5M_
│ ➼ *Ventajas:*
│ \t\t- Acceso al comando *${prefix}join* gratis${!inky.isJadi ? `
│ \t\t- Acceso al comando *${prefix}serbot*` : ''}
╰───────────────╮

│ ➼ Usuario: *@${senderNumber}*
│ ➼ Balance: *$${bal}*
│ ➼ Rango: *${rank}*

Para comprar un articulo use *${prefix + command} <articulo>*`
if (q.toLowerCase().includes('vip')) {
	if (isVip) return v.reply('Usted ya tiene el rango *✨ Vip ✨*')
	if (userBal < 2500000) return v.reply('No tienes suficiente dinero para comprar el rango *✨ Vip ✨*')
	removeBal(senderNumber, 2500000)
	vip.push(senderNumber)
	fs.writeFileSync('./database/user/vip.json', Json(vip))
	v.reply('@' + senderNumber + ' has comprado exitosamente el rango *✨ Vip ✨*, espero que lo disfrutes :D')
} else {
	v.reply(teks)
}
break

case 'work':
case 'trabajar':
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (setWork.has(senderNumber)) return v.reply('Espere 2 horas para volver a trabajar')
var amount = getRandom('')
addBal(senderNumber, Number(amount))
v.reply('Has trabajado duro, tu recompenza es de *$' + amount + '*')
if (isOwner) return
setWork.add(senderNumber)
await sleep(((1000 * 60) * 60) * 2)
setWork.delete(senderNumber)
break

/*
	Juego
*/

case 'bj':
case 'blackjack':
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false) return v.reply('Ya tienes un juego en curso')
if (isSpamBJ(senderNumber)) return v.reply('Espere 25 segundos para jugar de nuevo')
if (!q) return v.reply(`Ingrese un monto, ejemplo: ${prefix + command} <monto>`)
if (isNaN(args[0])) return v.reply('El monto tiene que ser un numero')
if (args[0] < 100) return v.reply('Monto minimo debe de ser de 100$')
if (args[0].includes('.')) return v.reply('No se puede jugar con numero decimales')
if (!isOwner) {
	if (isVip) {
		if (q > 10000) return v.reply('Maximo para apostar es de *$10K*')
	} else{
		if (q > 5000) return v.reply('Maximo para apostar es de *$5K*')
	}
}
if (userBal < args[0]) return v.reply('No tienes suficiente dinero')
var obj = {id: v.sender, from: v.chat, balance: args[0], pHand: [(drawRandomCard() - 1), drawRandomCard()], bHand: [(drawRandomCard() - 1), drawRandomCard()]}
bj.push(obj)
removeBal(senderNumber, Number(args[0]))
inky.sendMessage(v.chat, { text: `*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bj[position(bj, v.chat, v.sender)].pHand)}*\n\n🃏 Usa *Hit* o *Stand* 🃏`, footer: `Apuesta: *$${h2k(getHandValue(bj[position(bj, v.chat, v.sender)].balance).slice(1))}*\nBalance: *$${h2k(userBal-getHandValue(bj[position(bj, v.chat, v.sender)].balance))}*`, buttons: [{buttonId: 'bHit', buttonText: {displayText: 'Hit'}, type: 1}, {buttonId: 'bStand', buttonText: {displayText: 'Stand'}, type: 1}], headerType: 1, mentions: [v.sender] }, { quoted: v })
break

case 'casino':
await v.react('✨')
if (setCasino.has(senderNumber)) return v.reply('Espere 10 segundos para jugar de nuevo')
if (!q) return v.reply(`Ingrese un monto, ejemplo: ${prefix + command} <monto>`)
if (isNaN(q)) return v.reply('El monto tiene que ser un numero')
if (q < 50) return v.reply('Monto minimo debe de ser de 50$')
if (q.includes('.')) return v.reply('No se puede jugar con numero decimales')
if (q > 5000) return v.reply('Maximo para apostar es de *$5K*')
if (userBal < q) return v.reply('No tienes suficiente dinero')
var deck = ['10', '5', '5', '5', '5', '5']
var ran = deck[Math.floor(Math.random() * deck.length)]
var fail = ['🍊 : 🍒 : 🍐', '🍒 : 🔔 : 🍊', '🍊 : 🍋 : 🔔', '🔔 : 🍒 : 🍐', '🔔 : 🍒 : 🍊', '🍊 : 🍋 : 🔔', '🍐 : 🍒 : 🍋', '🍊 : 🍒 : 🍒', '🔔 : 🔔 : 🍇', '🍌 : 🍒 : 🔔', '🍐 : 🔔 : 🔔', '🍊 : 🍋 : 🍒', '🍋 : 🍋 : 🍌', '🔔 : 🔔 : 🍇', '🔔 : 🍐 : 🍇']
var win = ['🍇 : 🍇 : 🍇', '🍐 : 🍐 : 🍐', '🔔 : 🔔 : 🔔', '🍒 : 🍒 : 🍒', '🍊 : 🍊 : 🍊', '🍌 : 🍌 : 🍌']
var fail1 = fail[Math.floor(Math.random() * fail.length)]
var fail2 = fail[Math.floor(Math.random() * fail.length)]
var win1 = win[Math.floor(Math.random() * win.length)]     
if (ran < 10) {
	var teks = `╭─╼┥${botName}┝╾─╮\n╽ ┌──────────┐ ┃\n\t\t\t\t\t🍋 : 🍌 : 🍍\n┃ ├──────────┤ ┃\n\t\t\t\t\t${fail1}\n┃ ├──────────┤ ┃\n\t\t\t\t\t${fail2}\n╿ └──────────┘ ╿\n╰──┥${botName}┠──╯\n\nHas perdido $${h2k(q)}`
	removeBal(senderNumber, Number(args[0]))
} else {
	var teks = `╭─╼┥${botName}┝╾─╮\n╽ ┌──────────┐ ┃\n\t\t\t\t\t🍋 : 🍌 : 🍍\n┃ ├──────────┤ ┃\n\t\t\t\t\t${win1}\n┃ ├──────────┤ ┃\n\t\t\t\t\t${fail1}\n╿ └──────────┘ ╿\n╰──┥${botName}┠──╯\n\nFelicidades has ganado $${h2k((q * 5))}`
	addBal(senderNumber, (Number(args[0]) * 5))
}
v.reply(teks)
setCasino.add(senderNumber)
await sleep(5000)
setCasino.delete(senderNumber)
break

/*
	Convertidor
*/

case 's':
case 'stik':
case 'stiker':
case 'sticker':
await v.react('✨')
if ((v.type === 'imageMessage') || isQuotedImage) {
	v.reply(mess.wait)
	var nameJpg = getRandom('')
	isQuotedImage ? await v.quoted.download(nameJpg) : await v.download(nameJpg)
	var stik = await imageToWebp(nameJpg + '.jpg')
	writeExif(stik, {packname: 'ღ ' + v.pushName + ' 乂 ' + senderNumber + ' ღ', author: ''})
		.then(x => v.replyS(x))
} else if ((v.type === 'videoMessage') || isQuotedVideo) {
	v.reply(mess.wait)
	var nameMp4 = getRandom('')
	isQuotedVideo ? await v.quoted.download(nameMp4) : await v.download(nameMp4)
	var stik = await videoToWebp(nameMp4 + '.mp4')
	writeExif(stik, {packname: 'ღ ' + v.pushName + ' 乂 ' + senderNumber + ' ღ', author: ''})
		.then(x => v.replyS(x))
} else {
	v.reply('Responda a una imagen o video con el comando ' + prefix + command)
}
break

case 'robar':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command + ' <texto>')
var pack = q.split('|')[0]
var author = q.split('|')[1]
v.reply(mess.wait)
var nameWebp = getRandom('')
var media = await v.quoted.download(nameWebp)
await writeExif(media, {packname: pack, author: author})
	.then(x => v.replyS(x))
await fs.unlinkSync(nameWebp + '.webp')
break

case 'inkys':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command)
v.reply(mess.wait)
var nameWebp = getRandom('')
var media = await v.quoted.download(nameWebp)
await writeExif(media)
	.then(x => v.replyS(x))
fs.unlinkSync(nameWebp + '.webp')
break

case 'toimg':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker estatico con el comando *' + prefix + command + '* o use *' + prefix + 'togif*')
if (v.quoted.msg.isAnimated) return v.reply('Responda a un sticker estatico con el comando *' + prefix + command + '* o use *' + prefix + 'togif*')
v.reply(mess.wait)
var nameWebp = getRandom('')
var nameJpg = getRandom('.jpg')
await v.quoted.download(nameWebp)
exec(`ffmpeg -i ${nameWebp}.webp ${nameJpg}`, async(err) => {
	fs.unlinkSync(nameWebp + '.webp')
	if (err) return v.reply(String(err))
	await v.replyImg(fs.readFileSync(nameJpg))
	fs.unlinkSync(nameJpg)
})
break

case 'togif':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker animado con el comando *' + prefix + command + '* o use *' + prefix + 'toimg*')
if (!v.quoted.msg.isAnimated) return v.reply('Responda a un sticker animado con el comando *' + prefix + command + '* o use *' + prefix + 'toimg*')
v.reply(mess.wait)
var nameWebp = getRandom('')
await v.quoted.download(nameWebp)
webpToMp4(nameWebp + '.webp')
	.then(x => {
	v.replyVid({url: x}, fake, {gif: true})
	fs.unlinkSync(nameWebp + '.webp')
})
break

case 'tomp3':
await v.react('✨')
if (!isQuotedVideo) return v.reply('Responda a un video con el comando ' + prefix + command)
v.reply(mess.wait)
var nameMp4 = getRandom('')
var nameMp3 = getRandom('.mp3')
await v.quoted.download(nameMp4)
exec(`ffmpeg -i ${nameMp4}.mp4 ${nameMp3}`, async(e) => {
	fs.unlinkSync(nameMp4 + '.mp4')
	if (e) return v.reply(String(e))
	if (q == '-ppt') {
		await v.replyAud(fs.readFileSync(nameMp3), {ptt: true})
	} else {
		await v.replyAud(fs.readFileSync(nameMp3))
	}
	fs.unlinkSync(nameMp3)
})
break

/*
	Search
*/

case 'ssweb':
await v.react('✨')
if (!q) return v.reply('Use ' + prefix + command + ' <link>')
if (!isUrl(args[0])) return v.reply('Use ' + prefix + command + ' <link>')
v.reply(mess.wait)
var browser = await puppeteer.launch()
var page = await browser.newPage()
await page.setViewport({
	width: 1280,
	height: 720
})
await page.goto(args[0])
await page.waitForTimeout(1500)
await v.replyImg(await page.screenshot(), fake)
break

case 'google':
if (!q) return v.reply('Use ' + prefix + command + ' <texto>')
v.reply(mess.wait)
var browser = await puppeteer.launch()
var page = await browser.newPage()
await page.setViewport({
	width: 1280,
	height: 720
})
await page.goto('https://www.google.com/search?q=' + q)
await page.waitForTimeout(1500)
await v.replyImg(await page.screenshot(), fake)
break

/*
	Descarga
*/

case 'play':
await v.react('✨')
if (!q) return v.reply('Use *' + prefix + command + ' <texto>*')
var play = await yts(q)
var vid = play.videos[0]
var teks = `\t\t\t► ${botName} Youtube

ღ *Titulo:* ${vid.title}
ღ *Duracion:* ${vid.timestamp}
ღ *Visitas:* ${h2k(vid.views)}
ღ *Author:* ${vid.author.name}`
var buttons = [
	{urlButton: {displayText: '🔗 Link del Video 🔗', url: vid.url}},
	{quickReplyButton: {displayText: '🎵 Audio 🎵', id: prefix + 'ytmp3 ' + vid.url}},
	{quickReplyButton: {displayText: '🎬 Video 🎬', id: prefix + 'ytmp4 ' + vid.url}}
]
var buffer = await getBuffer(vid.image)
replyTempImg(teks, fake, buttons, buffer)
break

case 'tiktok':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('tiktok.com')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.ttdownloader(q)
	.then(x => v.replyVid({url: x.nowm}, fake))
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'igdl':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('instagram.com')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.igdl(q)
	.then(x => v.replyVid({url: x.medias[0].url}, fake))
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp3':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(async(x) => {
	await v.replyAud({url: x.mp3}, {ptt: true})
	v.replyDoc({url: x.mp3}, {mimetype: 'audio/mpeg', filename: x.title + '.mp3'})
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp4':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => v.replyVid({url: x.link}, fake))
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

/*
	Staff
*/

case 'bc':
if (!isOwner) return v.react('❌')
await v.react('✨')
var getGroups = await inky.groupFetchAllParticipating()
var groupsID = Object.entries(getGroups).slice(0).map(x => x[1]).map(x => x.id)
for (let id of groupsID) {
	var jids = []
	var groupMdata = await inky.groupMetadata(id)
	var groupMem = groupMdata.participants
	groupMem.map(x => jids.push(x.id))
	v.reply(`\t\t\t\t*${botName} BroadCast*\n\n${q}`, {id: id, mentions: jids, quoted: quotedStatus})
}
break

case 'mode':
if (!isStaff) return v.react('❌')
await v.react('✨')
if (q.toLowerCase() === 'public') {
	if (!inky.self) return v.reply('Ya estaba activo el modo publico')
	inky.self = false
	v.reply('Se ha activado el modo publico')
} else if (q.toLowerCase() === 'self') {
	if (inky.self) return v.reply('Ya estaba activo el modo privado')
	inky.self = true
	v.reply('Se ha activado el modo privado')
} else {
	v.reply('Use *' + prefix + command + ' <public/self>*')
}
break

case 'addbal':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (isNaN(args[0])) return v.reply('El monto tiene que ser un numero')
addBal(v.mentionUser[0].split('@')[0], Number(args[0]))
v.reply(`\t\t\tDeposito de dinero\n\n│ ➼ Monto: $${h2k(args[0])}\n│ ➼ Usuario: @${v.mentionUser[0].split('@')[0]}`, {mentions: [v.mentionUser[0]]})
break

case 'delbal':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (isNaN(args[0])) return v.reply('El monto tiene que ser un numero')
if ((checkBal(v.mentionUser[0].split('@')[0]) ? checkBal(v.mentionUser[0].split('@')[0]) : '0') < args[0]) return v.reply('El usuario no cuenta con suficiente dinero')
removeBal(v.mentionUser[0].split('@')[0], Number(args[0]))
v.reply(`\t\t\tDescuento de dinero\n\n│ ➼ Monto: $${h2k(args[0])}\n│ ➼ Usuario: @${v.mentionUser[0].split('@')[0]}`, {mentions: [v.mentionUser[0]]})
break

case 'addvip':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (vip.includes(v.mentionUser[0].split('@')[0])) return v.reply('El usuario ya tiene el rango *✨ Vip ✨*')
vip.push(v.mentionUser[0].split('@')[0])
await fs.writeFileSync('./database/user/vip.json', Json(vip))
v.reply('Ha sido agregado el rango *✨ Vip ✨* a @' + v.mentionUser[0].split('@')[0], {mentions: [v.sender, v.mentionUser[0]]})
break

case 'delvip':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (!vip.includes(v.mentionUser[0].split('@')[0])) return v.reply('El usuario no es usuario *✨ Vip ✨*')
vip.splice(v.mentionUser[0].split('@')[0])
await fs.writeFileSync('./database/user/vip.json', Json(vip))
v.reply('Ha sido removido el rango *✨ Vip ✨* de @' + v.mentionUser[0].split('@')[0], {mentions: [v.sender, v.mentionUser[0]]})
break

case 'save':
if (!isStaff) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (!q) return v.reply('Nombre para el archivo?')
if (!v.quoted) return v.reply('Responde a un archivo para guardarlo')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if (isQuotedSticker) {
	if (sFiles[0].sticker.includes(q + '.webp')) return v.reply('Ya existe un sticker con ese nombre')
	var nameWebp = getRandom('')
	var media = await v.quoted.download(nameWebp)
	await fs.writeFileSync(`./media/sticker/${q}.webp`, media)
	fs.unlinkSync(nameWebp + '.webp')
	v.reply('Sticker guardado exitosamente')
} else if (isQuotedAudio) {
	if (sFiles[0].audio.includes(q + '.mp3')) return v.reply('Ya existe un audio con ese nombre')
	var nameMp3 = getRandom('')
	var media = await v.quoted.download(nameMp3)
	await fs.writeFileSync(`./media/audio/${q}.mp3`, media)
	fs.unlinkSync(nameMp3 + '.mp3')
	v.reply('Audio guardado exitosamente')
} else if (isQuotedImage) {
	if (sFiles[0].image.includes(q + '.jpg')) return v.reply('Ya existe una imagen con ese nombre')
	var nameJpg = getRandom('')
	var media = await v.quoted.download(nameJpg)
	await fs.writeFileSync(`./media/image/${q}.jpg`, media)
	fs.unlinkSync(nameJpg + '.jpg')
	v.reply('Imagen guardado exitosamente')
} else if (isQuotedVideo) {
	if (sFiles[0].video.includes(q + '.mp4')) return v.reply('Ya existe un video con ese nombre')
	var nameMp4 = getRandom('')
	var media = await v.quoted.download(nameMp4)
	await fs.writeFileSync(`./media/video/${q}.mp4`, media)
	fs.unlinkSync(nameMp4 + '.mp4')
	v.reply('Video guardado exitosamente')
} else {
	v.reply('Responde a un archivo para guardarlo')
}
break

case 'storage':
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
teks = `\t\t\t\t${botName} Storage\n\nღ *Stickers* (${(sFiles[0].sticker.length - 1)})\n`
if (sFiles[0].sticker.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].sticker) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.webp', '')}`
	}
}
teks += `\n\nღ *Audios* (${(sFiles[0].audio.length - 1)})\n`
if (sFiles[0].audio.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].audio) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.mp3', '')}`
	}
}
teks += `\n\nღ *Imagenes* (${(sFiles[0].image.length - 1)})\n`
if (sFiles[0].image.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].image) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.jpg', '')}`
	}
}
teks += `\n\nღ *Videos* (${(sFiles[0].video.length - 1)})\n`
if (sFiles[0].video.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].video) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.mp4', '')}`
	}
}
teks += `\n\nUse *${prefix}send <nombre del archivo>* para visualizarlo${!inky.isJadi ? `\n\nUse *${prefix}delfile <nombre del archivo>* para eliminarlo` : ''}`
v.reply(teks)
break

case 'send':
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if ((sFiles[0].sticker.includes(q + '.webp')) || (sFiles[0].audio.includes(q + '.mp3')) || (sFiles[0].image.includes(q + '.jpg')) || (sFiles[0].video.includes(q + '.mp4'))) {
	if (sFiles[0].sticker.includes(q + '.webp')) {
		v.replyS(fs.readFileSync('./media/sticker/' + q + '.webp'))
	}
	if (sFiles[0].audio.includes(q + '.mp3')) {
		v.replyAud(fs.readFileSync('./media/audio/' + q + '.mp3'), {ptt: true})
	}
	if (sFiles[0].image.includes(q + '.jpg')) {
		v.replyImg(fs.readFileSync('./media/image/' + q + '.jpg'), fake)
	}
	if (sFiles[0].video.includes(q + '.mp4')) {
		v.replyVid(fs.readFileSync('./media/video/' + q + '.mp4'), fake)
	}
} else {
	v.reply('No existe ningun archivo con ese nombre')
}
break

case 'delfile':
if (!isStaff) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if ((sFiles[0].sticker.includes(q + '.webp')) || (sFiles[0].audio.includes(q + '.mp3')) || (sFiles[0].image.includes(q + '.jpg')) || (sFiles[0].video.includes(q + '.mp4'))) {
	if (sFiles[0].sticker.includes(q + '.webp')) {
		await fs.unlinkSync('./media/sticker/' + q + '.webp')
		v.reply('Sticker eliminado exitosamente')
	}
	if (sFiles[0].audio.includes(q + '.mp3')) {
		await fs.unlinkSync('./media/audio/' + q + '.mp3')
		v.reply('Audio eliminado exitosamente')
	}
	if (sFiles[0].image.includes(q + '.jpg')) {
		await fs.unlinkSync('./media/image/' + q + '.jpg')
		v.reply('Imagen eliminado exitosamente')
	}
	if (sFiles[0].video.includes(q + '.mp4')) {
		await fs.unlinkSync('./media/video/' + q + '.mp4')
		v.reply('Video eliminado exitosamente')
	}
} else {
	v.reply('No existe ningun archivo con ese nombre')
}
break

			default:
				
				if (isOwner) {
					if (inky.isJadi) return
					if (body.startsWith('x')) {
						try {
							v.reply(Json(eval(q)))
						} catch(e) {
							v.reply(String(e))
						}
					}
					if (body.startsWith('>')) {
						try {
							v.reply(util.format(await eval(`(async () => {${body.slice(1)}})()`)))
						} catch(e) {
							v.reply(util.format(e))
						}
					}
					if (body.startsWith('$')) {
						exec(body.slice(1), (err, stdout) => {
							if (err) return v.reply(err)
							if (stdout) return v.reply(stdout)
						})
					}
				}
				
				if (body.toLowerCase().includes('teta')) {
					v.replyS(fs.readFileSync('./media/sticker/Tetas♡.webp'))
				}
				if (body.toLowerCase().startsWith('bot')) {
					var none = await fetchJson(`https://api.simsimi.net/v2/?text=${q}&lc=es`)
					v.reply(none.success)
				}
				
				if (isCmd) {
					v.react('❌')
				}
				
				if (body.toLowerCase().startsWith('hit') || buttonsResponseID.includes('bHit')) {
					if (!(isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false)) return
					await v.react('✨')
					var bjPosition = bj[position(bj, v.chat, v.sender)]
					bjPosition.pHand.push(drawRandomCard())
					if (getHandValue(bjPosition.bHand) <= 10) {
						bjPosition.bHand.push(drawRandomCard())
					}
					if (getHandValue(bjPosition.pHand) > 21) {
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Has perdido $${h2k(bjPosition.balance)}* 🃏`)
						bj.splice(bj.indexOf(bjPosition), 1)
						addSetBJ(senderNumber)
					} else {
						inky.sendMessage(v.chat, { text: `*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n\n🃏 Usa *Hit* o *Stand* 🃏`, footer: `Apuesta: *$${h2k(bjPosition.balance)}*\nBalance: *$${bal}*`, buttons: [{buttonId: 'bHit', buttonText: {displayText: 'Hit'}, type: 1}, {buttonId: 'bStand', buttonText: {displayText: 'Stand'}, type: 1}], headerType: 1, mentions: [v.sender] }, { quoted: v })
					}
				}
				if (body.toLowerCase().startsWith('stand') || buttonsResponseID.includes('bStand')) {
					if (!(isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false)) return
					await v.react('✨')
					var bjPosition = bj[position(bj, v.chat, v.sender)]
					bj.splice(bj.indexOf(bjPosition), 1)
					addSetBJ(senderNumber)
					if (getHandValue(bjPosition.pHand) < getHandValue(bjPosition.bHand)) {
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Has perdido $${h2k(bjPosition.balance)}* 🃏`)
					} else if (getHandValue(bjPosition.pHand) === getHandValue(bjPosition.bHand)) {
						var result = Number(bjPosition.balance)
						addBal(senderNumber, result)
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Ha sido un empate* 🃏`)
					} else {
						var result = Number(bjPosition.balance)*2
						addBal(senderNumber, result)
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Felicidades has ganado $${h2k(result)}* 🃏`)
					}
				}
				
		}
		
	} catch (e) {
		const isError = String(e)
		
		inky.sendMessage(groupError, { text: isError }, { quoted: v })
		console.log(e)
	}
}
