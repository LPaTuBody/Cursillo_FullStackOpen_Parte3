let notes = [
    {
      "id": "1",
      "content": "HTML is easy",
      "important": true
    },
    {
      "id": "2",
      "content": "Browser can execute only JavaScript",
      "important": false
    },
    {
      "id": "3",
      "content": "GET and POST are the most important methods of HTTP protocol",
      "important": true
    },
    {
      "id": "4",
      "content": "It's not that bad just get out and touch some grass",
      "important": false
    }
  ]

/* 
const http = require('http') // Importing the http module to create a server
// import http from 'http' es lo mismo que la línea de arriba, pero con sintaxis ES6

const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(notes)) // Responds with the notes array as a JSON string
})
// The above code creates a server that listens for incoming requests and responds with "Hello World"  
*/

const express = require('express')
const cors = require('cors') // Importing the cors module to enable CORS (Cross-Origin Resource Sharing)
const app = express()

app.use(express.json()) // Middleware to parse JSON bodies of incoming requests
app.use(cors()) // Middleware to enable CORS for all routes
app.use(express.static('dist')) // Middleware to serve static files from the 'dist' directory
/* pequeño recordatorio: dist es el directorio donde se encuentra el archivo index.html de la aplicación React que se comprimió y se construyó con el comando npm run build */

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next() // Calls the next middleware in the stack
} // Middleware to log request details
app.use(requestLogger) // Using the requestLogger middleware

/* 
Los middleware son funciones que se pueden utilizar para manejar objetos de request y response.
Las funciones de middleware deben utilizarse antes que las rutas cuando queremos que sean ejecutadas por los controladores de eventos de ruta.
Los middleware se ejecutan en orden según son encontrados por el motor JS 
*/

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (req, res) => res.json(notes)) 

app.get('/api/notes/:id', (request, response) => { // dos puntos antes de id indican que es un parámetro
    const id = request.params.id // Extracts the id from the request parameters
    const note = notes.find(note => note.id === id) // Finds the note with the matching id
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => Number(n.id))) : 0 // Finds the maximum id in the notes array
    return maxId + 1
}

app.post('/api/notes', (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({ error: 'content missing' }) // Returns a 400 error if content is missing
    }

    const note = {
        id: generateId(), 
        content: body.content,
        important: body.important || false 
    }

    notes = notes.concat(note) // Adds the new note to the notes array
    response.json(note)

    // console.log(note)
    // console.log(request.headers) // Logs all headers of the request
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
} // Middleware to handle unknown endpoints
// If a request is made to an endpoint that does not exist, this middleware will respond with a 404 error
app.use(unknownEndpoint)
/* Los middleware se colocan después de las rutas si ningún controlador de eventos de dichas rutas se encarga de la solicitud HTTP del mismo middleware */

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
}) // The server listens on port 3001