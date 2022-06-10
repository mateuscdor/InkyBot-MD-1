const isGiveaway = (giveaway, from) => {
  let p = false
  Object.keys().forEach((i) => {
    if (giveaway[i].from === from) {
      let p = giveaway[i]
    }
  })
}

module.exports = { isGiveaway }
