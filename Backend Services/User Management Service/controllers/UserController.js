var mysql      = require('mysql'),
    crypto     = require('crypto'),
    Validator  = require('validator'),
    lodash     = require('lodash');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'yarr!'
});

connection.connect();

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
      res.status(200).send(`{"result": "Failure", "error": ${JSON.stringify(errors)}}`);
      return;
    }

    let hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    connection.query('INSERT INTO researchers (UserName, HashedPassword, FirstName, LastName, Email)' + 
      `VALUES ("${userName}", "${hashedPassword}", "${firstName}", "${lastName}", "${email}")`, (error, results) => {
      if(error)
        res.status(200).send(`{"result": "Failure", "error": ${JSON.stringify(error)}}`);
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
        res.status(400).send(`{"result": "Failure", "error": "No users found."}`); 
      }
      else{
        let hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        let bearerKey = crypto.createHash('md5').update(toString(results[0].ResearcherId)).digest('hex');

        if(hashedPassword === results[0].HashedPassword)
          res.status(200).send(`{"result": "Verified", "bearerKey": "${bearerKey}"}`);
        else res.status(400).send(`{"result": "wrongPassword"}`);

      }
    });
  }
}