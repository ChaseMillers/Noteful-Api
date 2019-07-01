const path = require('path');
const express = require('express');
const xss = require('xss'); 
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: note.id,
  modified: note.modified,
  name: xss(note.name),
  folderId: note.folderId,
  content: xss(note.content),
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(notes =>{
        res.json(notes)
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const { name, folderid, content } = req.body
    const newNote = { name, folderid, content }

    for (const [key, value] of Object.entries(newNote)) 
      if (value == null) 
             return res.status(400).json({
               error: { message: `Missing '${key}' in request body` }
             })
           
    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
         NotesService.getNoteById(
           req.app.get('db'),
           req.params.note_id
         )
           .then(note => {
             if (!note) {
               return res.status(404).json({
                 error: { message: `Note doesn't exist` }
               })
             }
             res.note = note // save the note for the next middleware
             next() 
           })
           .catch(next)
       })
        .get((req, res, next) => {
         res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(
           req.app.get('db'),
           req.params.note_id
         )
           .then(numRowsAffected => {
             res.status(204).end()
           })
           .catch(next)
       })
  .patch(jsonParser, (req, res, next) => {
        const { name, folderid, content } = req.body
        const noteToUpdate = { id, name, folderid, content }
    
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
          return res.status(400).json({
            error: {
              message: `Request body must content either 'name', 'folderId' or 'content'`
            }
          })
    
        NotesService.updateNote(
          req.app.get('db'),
          req.params.note_id,
          noteToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
        })

module.exports = notesRouter