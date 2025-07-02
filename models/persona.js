const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
console.log('conectando a', url)

mongoose.set('strictQuery', false)

mongoose.connect(url).then(() => {
    console.log('conexión exitosa a MongoDB')
})
.catch((error) => {
    console.error('error de conexión a MongoDB:', error.message)
})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    number: {
        type: String,
        required: true,
        length: 10,
        validate: {
            validator: (v) => {
                return /\(\d{3}\)\s\d{3}-\d{4}$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    }
})

personSchema.set('toJSON', {
    transform: (doc, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj.__v
    }
})

module.exports = mongoose.model('Person', personSchema)