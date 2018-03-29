var default_config = require('./config/development.json')
var env = require(`./config/development.json`)

export default Object.assign({}, default_config, env)
