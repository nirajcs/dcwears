const myEnv = require('dotenv').config()
const ADMIN_EMAIL = process.env.EMAIL
const APP_PASSWORD = process.env.APP_PASSWORD
const KEY_ID = process.env.KEY_ID
const KEY_SECRET = process.env.KEY_SECRET
const PAY_MAIL = process.env.PAY_MAIL




module.exports = {
    ADMIN_EMAIL,
    APP_PASSWORD,
    KEY_ID,
    KEY_SECRET,
    PAY_MAIL
}