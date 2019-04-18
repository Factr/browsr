var default_config = require('./config/default.json')
var env = require(`./config/${BROWSR_ENV}.json`)

export default Object.assign({}, default_config, env)
