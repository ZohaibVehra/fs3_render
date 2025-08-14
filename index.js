const express = require('express')
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/persons')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

/*const generateID = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => Number(n.id)))
        : 0
    return String(maxId + 1)
}*/

app.get('/api/persons', (request, response) => {
  Person.find({}).then(res => response.json(res))
})

app.get('/info', (request, response) => {
  const now = new Date()
  Person.find({}).then(res => {
    response.send(`Phonebook has info on ${res.length} people<br/>${now}`)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(res => response.json(res)).catch(err => {
    console.log(err)
    response.status(404).end()
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name && !body.number){
        return response.status(400).json({error: 'name and number missing'})
    }
    else if(!body.name){
        return response.status(400).json({error: 'name missing'})
    }
    else if(!body.number){
        return response.status(400).json({error: 'number missing'})
    }

    const nameExists = persons.some(p => p.name === body.name)
    if (nameExists) {
        return response.status(400).json({ error: 'name must be unique' })
    }
    
    const person = {
        name: body.name,
        number: body.number,
        id: String(Math.floor(Math.random() * 1000000))
    }

    persons = persons.concat(person)
    response.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})