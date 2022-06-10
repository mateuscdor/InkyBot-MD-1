const addGiveaways = () => {}

const isGiveaway = (giveaway, from) => {
  let p = false
  Object.keys(giveaway).forEach((i) => {
    if (giveaway[i].from === from) {
      p = giveaway[i]
    }
  })
  return p
}

const isGiveaways = (giveaway, owner, premio) => {
  let p = false
  Object.keys(giveaway).forEach((i) => {
    if (giveaway[i].owner == owner && giveaway[i].premio == premio) {
      p = giveaway[i]
    }
  })
  return p
}

const addGiveaway = (giveaway, from) => {
  return new Promise((resolve, reject) => {
    if (isGiveaway(giveaway, from)) return reject('There is already a giveaway in the group')
    let obj = {from: from, giveaways: []}
    giveaway.push(obj)
    resolve(giveaway)
  })
}

module.exports = { addGiveaway, isGiveaway, isGiveaways }
