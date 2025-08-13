const mongoose = require('mongoose')


if(process.argv.length < 3){
    console.log('enter password as argument');
    process.exit(1)    
}

const password = process.argv[2]

const url = 'mongodb+srv://zohaib:'+ password+ '@phonebook-cluster.hz7axxf.mongodb.net/persons?retryWrites=true&w=majority&appName=phonebook-cluster'

mongoose.connect(url)

mongoose.set('strictQuery',false)


const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)


if(process.argv.length === 5){
    const newPerson = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    newPerson.save().then(res => {
        console.log('saved person')
        mongoose.connection.close()
    })}else{
    console.log('phonebook:')
    Person.find({}).then(res =>  {
        res.forEach(person => console.log(person))
        mongoose.connection.close()
    })
}



