const chai = require('chai');
const chaiHttp = require('chai-http');

const { app } = require('../app');
const db = require('../services/database');

chai.use(chaiHttp);
chai.should();

describe('User', () => {
  beforeEach((done) => db.remove({}, { multi: true }, () => done()));

  const newUser = {
    username: 'tester',
    password: '12345',
  };

  describe('/POST create user', () => {
    it('it should create an user', (done) => {
      chai.request(app)
        .post('/users')
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user.should.have.property('username');
          res.body.user.should.have.property('password');
          res.body.user.should.have.property('_id');
          res.body.user.username.should.be.eql(newUser.username);
          done();
        });
    });
  });

  describe('/POST login user', () => {
    it('it should login with the new user', (done) => {
      chai.request(app)
        .post('/users/login')
        .send(newUser)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
