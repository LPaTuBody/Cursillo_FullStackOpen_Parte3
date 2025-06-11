const express = require('express')
const morgan = require('morgan')
const app = express()

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

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "(809) 333-3333"
    },
    {
        "id": "2",
        "name": "María Carreño",
        "number": "(809) 131-5672"
    },
    {
        "id": "3",
        "name": "Fernando García",
        "number": "(809) 125-5256"
    },
    {
        "id": "4",
        "name": "Josefina Almonte",
        "number": "(809) 401-6543"
    },
    {
        "id": "5",
        "name": "Génesis Núñez",
        "number": "(809) 048-5651"
    }
]

app.get('/api/persons', (req, res) => res.json(persons))

app.get('/info', (req, res) => {
    const entriesCount = persons.length
    const currentDate = new Date().toString()
    console.log(entriesCount)
    console.log(currentDate)
    res.send(`
        <p>Phonebook has info for ${entriesCount} people</p>
        <p>${currentDate}</p>
    `)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = persons.find(p => p.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    persons = persons.filter(p => p.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'name or number is missing' })
    }

    if (persons.some(p => p.name === body.name)) {
        return res.status(400).json({ error: 'name must be unique' })
    }

    const newPerson = {
        id: (Math.random() * 10000).toFixed(0),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(newPerson)
    res.json(newPerson)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})