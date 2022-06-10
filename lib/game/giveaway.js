const isGiveaway = (giveaway, from) => {
  let p = false
  Object.keys(giveaway).forEach((i) => {
    if (giveaway[i].from === from) {
      let p = giveaway[i]
    }
  })
  return p
}

module.exports = { isGiveaway }
