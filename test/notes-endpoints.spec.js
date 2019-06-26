const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')

describe('Notes Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('notes').truncate())

  afterEach('cleanup',() => db('notes').truncate())

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
           it(`responds with 200 and an empty list`, () => {
             return supertest(app)
               .get('/api/notes')
               .expect(200, [])
           })
         })

  context('Given there are notes in the database', () => {
    const testNotes = makeNotesArray()

    beforeEach('insert notes', () => {
      return db
        .into('notes')
        .insert(testNotes)
    })

    it('responds with 200 and all of the notes', () => {
      return supertest(app)
        .get('/api/notes')
        .expect(200, testNotes)
    })
  })
})

describe(`GET /api/notes/:note_id`, () => {
  context(`Given no notes`, () => {
         it(`responds with 404`, () => {
           const noteId = 1234567
           return supertest(app)
             .get(`/api/notes/${noteId}`)
             .expect(404, { error: { message: `Note doesn't exist` } })
         })
       })

  context('Given there are notes in the database', () => {
    const testNotes = makeNotesArray()

    beforeEach('insert notes', () => {
      return db
        .into('notes')
        .insert(testNotes)
    })

    it('GET /api/notes/:note_id responds with 200 and the specified note', () => {
      const noteId = 2
      const expectedNote = testNotes[noteId - 1]
      return supertest(app)
        .get(`/api/notes/${noteId}`)
        .expect(200, expectedNote)
    })
  })
})
describe(`POST /api/notes`, () => {
     it(`creates an note, responding with 201 and the new note`,  function() {
      const newNote = {
        name: 'Test new note',
        folderId: 1,
        content: 'Test new note content...'
      } 

      const requiredFields = ['name', 'folderId', 'content']
      
      requiredFields.forEach(field => {
           const newArticle = {
             name: 'Test new article',
             folderId: 3,
             content: 'Test new article content...'
           }
      
        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newNote[field]
      
          return supertest(app)
            .post('/api/notes')
            .send(newNote)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` }
            })
        })
      })

      return supertest(app)
         .post('/api/notes')
         .send(newNote)
         .expect(201)
         .expect(res => {
                   expect(res.body.name).to.eql(newArticle.name)
                   expect(res.body.folderId).to.eql(newArticle.folderId)
                   expect(res.body.content).to.eql(newArticle.content)
                   expect(res.body).to.have.property('id')
     })
     .then(postRes =>
               supertest(app)
                 .get(`/notes/${postRes.body.id}`)
                 .expect(postRes.body)
             )
   })
  })

describe.only(`DELETE /api/notes/:note_id`, () => {
  context(`Given no notes`, () => {
         it(`responds with 404`, () => {
           const noteId = 123456
           return supertest(app)
             .delete(`/notes/${noteId}`)
             .expect(404, { error: { message: `Note doesn't exist` } })
         })
       })   
  context('Given there are notes in the database', () => {
       const testNotes = makeNotesArray()
  
       beforeEach('insert notes', () => {
         return db
           .into('notes')
           .insert(testNotes)
       })
  
       it('responds with 204 and removes the note', () => {
         const idToRemove = 2
         const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
         return supertest(app)
           .delete(`/api/notes/${idToRemove}`)
           .expect(204)
           .then(res =>
             supertest(app)
               .get(`/api/notes`)
               .expect(expectedNotes)
           )
       })
     })
})
})
