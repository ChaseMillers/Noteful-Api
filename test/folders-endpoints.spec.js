const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')

describe('Folders Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE folders RESTART IDENTITY CASCADE'))

    describe(`GET /api/folders`, () => {
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get('/api/folders')
                .expect(200, [])
            })
        })

        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db
                .into('folders')
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('folders')
                        .insert(testFolders)
                })
            })

            it('responds with 200 and all of the folders', () => {
                return supertest(app)
                    .get('api/folders')
                    .expect(200, testFolders)
            })
        })

        //test for malicious attack 
    })

    describe(`GET /api/folders/:folder_id`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 123456
                return supertest(app)
                .get(`/api/folders/${folderId}`)
                .expect(404, {error: { message: `Folder doesn't exist`}})
            })
        })

        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('folders')
                            .insert(testFolders)
                    })
            })

            it('responds with 200 and hte specified folder', () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })
        })
        //xss attack logic
    })

    describe(`POST /api/folders`, () => {
        const testFolders = makeFoldersArray();
        //xss logic to fix malicious article

        it(`creates a folder, responding with 201 and the new article`, () => {
            const newFolder = {
                folder_name: 'This new folder'
            }
            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/folders/${res.body.id}`)
                        .expect(res.body)
                )
        })
    })
})
