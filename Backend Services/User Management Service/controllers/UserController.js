const lodash = require('lodash');
const crypto = require('crypto');
const Validator = require('validator');
const { connection } = require('../database.js');

function validateInput(data){
    let errors = {}
    const { userName, password, confirmedPassword, firstName, lastName, email } = data;
    if(lodash.isUndefined(userName)){
     errors.userName = "User name is required";   
    }
    
    if(lodash.isUndefined(password)){
        errors.password = "Password is required";   
    }

    if(lodash.isUndefined(confirmedPassword)){
        errors.confirmedPassword = "Password confirmation is required";   
    }

    if(!Validator.equals(password, confirmedPassword)){
        errors.confirmedPassword = "Passwords do not match";
    }

    if(lodash.isUndefined(firstName)){
        errors.firstName = "First name is required";   
    }

    if(lodash.isUndefined(lastName)){
        errors.lastName = "Last name is required";   
    }
    
    if(!Validator.isEmail(email)){
        errors.email = "Email is invalid";   
    }
    
    if(lodash.isUndefined(email)){
        errors.email = "Email is required";   
    }

    return{
        errors,
        isValid: lodash.isEmpty(errors)
    }
}

module.exports = {
  getResearcher: async(req, res) => {

    let { userName } = req.query;
    if(!userName){
        res.status(400).send(`{"result": "Failure", "error": "userName is required"}`);
        return;
    }

    connection.query(`SELECT * FROM researchers WHERE UserName = "${userName}"`, (error, results) => {
      if(error){
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`); 
      }
      else if(!results.length){
        res.status(400).send(`{"result": "Failure", "error": "No users found."}`); 
      }
      else {
        let { UserName, FirstName, LastName, Email } = results[0];
        res.status(200).send(`{"result": "Success", "user": {"userName":  "${UserName}", "firstName": "${FirstName}", 
          "lastName": "${LastName}", "email": "${Email}"}}`);
      }
    });
  },

  addResearcher: async(req, res) => {
    const { userName, password, firstName, lastName, email } = req.body;

    const { errors, isValid } = validateInput(req.body);
    if(!isValid){
      res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(errors)}}`);
      return;
    }

    let hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    connection.query('INSERT INTO researchers (UserName, HashedPassword, FirstName, LastName, Email)' + 
      `VALUES ("${userName}", "${hashedPassword}", "${firstName}", "${lastName}", "${email}")`, (error, results) => {
      if(error)
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      else res.status(200).send(`{"result": "Success", "params": ${JSON.stringify(results)}}`);
    });
  },

  // updateResearcher: async(req, res) => {
  //   let { userName, newPassword, oldPassword } = req.body;
  // },

  // deleteResearcher: async(req, res) => {
  //   let { userName } = req.body;

  //   if(!userName){
  //     res.status(400).send(`{"result": "Failure", "params": {"userName":"${userName}"}, 
  //     "msg": "A Parameter is missing."}`);
  //     return;
  //   }

  //   connection.query(`DELETE FROM researchers WHERE UserName = "${userName}"`, (error, results) => {
  //     if(error){
  //       res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`); 
  //     }
  //     else {
  //       if(results.affectedRows > 0)
  //         res.status(200).send(`{"result": "Success", "msg": "User: ${userName} was deleted."}`);
  //       else res.status(400).send(`{"result": "Failure", "error": "No users found."}`); 
  //     }
  //   });
  // },

  verifyResearcher: async(req, res) => {
    let { userName, password } = req.body;
    if(!userName || !password){
      res.status(400).send(`{"result": "Failure", "params": {"userName":"${userName}","password": "${password}"}, 
      "msg": "A Parameter is missing."}`);
      return;
    }
    connection.query(`SELECT * FROM researchers WHERE UserName = "${userName}"`, (error, results) => {
      if(error){
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`); 
      }
      else if(!results.length){
        res.status(400).send(`{"result": "Failure", "error": "BAD USER NAME AND/OR PASSWORD"}`); 
      }
      else{
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        
        if(hashedPassword === results[0].HashedPassword){
          const { ResearcherId, UserName, FirstName, LastName, Email } = results[0];
          const userInfo = {
            researcherId: ResearcherId,
            userName: UserName,
            firstName: FirstName,
            lastName: LastName,
            email: Email,
          }

          const tempStr = `${Email}${ResearcherId}${LastName}`
          const bearerKey = crypto.createHash('md5').update(tempStr).digest('hex');
          res.status(200).send(`{"result": "Verified", "bearerKey": "${bearerKey}", "userInfo": ${JSON.stringify(userInfo)}}`);
        }
        else res.status(400).send(`{"result": "Failure", "error": "BAD USER NAME AND/OR PASSWORD"}`);

      }
    });
  },

  verifyRequest: async (req, res) => {
    const { userInfo, bearerKey } = req.body;

    if (!userInfo || !bearerKey || !userInfo.researcherId) {
      res.status(400).send(`{"result": "Failure", "params": {"userInfo":"${JSON.stringify(userInfo)}", "bearerKey": "${bearerKey}"}, 
      "msg": "A Parameter is missing."}`);
      return;
    }

    const { researcherId } = userInfo

    connection.query(`SELECT * FROM researchers WHERE ResearcherId = "${researcherId}"`, (error, results) => {
      if (error) {
        res.status(400).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
      }
      else if (!results.length) {
        res.status(400).send(`{"result": "Failure", "error": "NO SUCH USER"}`);
      }
      else {
        const { ResearcherId, LastName, Email } = results[0];

          const tempStr = `${Email}${ResearcherId}${LastName}`
          const dbBearerKey = crypto.createHash('md5').update(tempStr).digest('hex');
          if(bearerKey === dbBearerKey){
            res.status(200).send(`{"result": "Success"}`);
          }
          else res.status(400).send(`{"result": "Failure", "error": "BAD BEARER KEY"}`);
        }
    });
  }
}