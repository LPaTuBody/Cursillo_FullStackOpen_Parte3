require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const Person = require('./models/persona')
const app = express()

// Middlewares
app.use(express.static('dist'))
app.use(express.json())
// app.use(morgan('tiny'))

app.use(morgan((tokens, req, res) => {
    // console.log(req.method, tokens.method(req, res))
    const body = req.method === 'POST' ? JSON.stringify(req.body) : ''
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        body
    ].join(' ')
}))

// Routes
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => res.json(persons))
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        const entriesCount = persons.length
        const currentDate = new Date().toString()
        console.log(entriesCount)
        console.log(currentDate)
        res.send(`
            <p>Phonebook has info for ${entriesCount} people</p>
            <p>${currentDate}</p>
        `)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
    .then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).send({ error: 'Person not found' })
        }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body
    Person.findByIdAndUpdate(
        req.params.id, 
        { name, number }, 
        { new: true, runValidators: true, context: 'query' }
    )
    .then(updated => res.json(updated))
    .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).send({ error: 'Name or number is missing' })
    } else {
        const newPerson = new Person({
            name: body.name,
            number: body.number
        })
        newPerson.save()
        .then(savedPerson => res.json(savedPerson))
        .catch(err => next(err))
    }    
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => next(err))
})

// Middlewares to handle errors
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log(error.name,":", error.message)
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'Malformatted id' })
    } else if (error.name === 'TypeError') {
        return res.status(400).send({ error: 'Type error, body need to be in/parsed to JSON' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)

// Port configuration
const PORT = process.env.PORT
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})