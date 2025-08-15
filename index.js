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

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if(error.name === 'ValidationError'){
    console.log('valid err')
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(res => response.json(res))
})

app.get('/info', (request, response) => {
  const now = new Date()
  Person.find({}).then(res => {
    response.send(`Phonebook has info on ${res.length} people<br/>${now}`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(res => response.json(res))
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if(!body.name && !body.number){
    return response.status(400).json({ error: 'name and number missing' })
  }
  else if(!body.name){
    return response.status(400).json({ error: 'name missing' })
  }
  else if(!body.number){
    return response.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: String(Math.floor(Math.random() * 1000000))
  })


  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})